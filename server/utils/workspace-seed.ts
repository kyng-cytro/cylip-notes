import type {
  WorkspaceLabel,
  WorkspaceNote,
  WorkspaceSnapshot,
} from "@/lib/sync/protocol";
import { generateNKeysBetween } from "fractional-indexing";

type Keyed = { sortKey: string | null };

const withSortKeys = <T extends Keyed>(
  items: T[],
): (T & { sortKey: string })[] => {
  const lastKey = items
    .map((item) => item.sortKey)
    .filter((key): key is string => !!key)
    .sort()
    .at(-1);
  const missing = items.filter((item) => !item.sortKey);
  const keys = generateNKeysBetween(lastKey ?? null, null, missing.length);
  const assigned = new Map(missing.map((item, i) => [item, keys[i]!]));
  return items.map((item) => ({
    ...item,
    sortKey: item.sortKey ?? assigned.get(item)!,
  }));
};

const sharedNoteIds = async (userId: string) => {
  const db = useDrizzle();
  const [members, invites] = await Promise.all([
    db
      .selectDistinct({ id: tables.noteMember.noteId })
      .from(tables.noteMember)
      .innerJoin(tables.note, eq(tables.note.id, tables.noteMember.noteId))
      .where(eq(tables.note.userId, userId)),
    db
      .selectDistinct({ id: tables.noteInvite.noteId })
      .from(tables.noteInvite)
      .innerJoin(tables.note, eq(tables.note.id, tables.noteInvite.noteId))
      .where(eq(tables.note.userId, userId)),
  ]);
  return new Set([...members, ...invites].map((row) => row.id));
};

const loadRows = (userId: string) => {
  const db = useDrizzle();
  return Promise.all([
    db.query.note.findMany({
      where: eq(tables.note.userId, userId),
      orderBy: (n, { desc }) => [desc(n.globalOrder), desc(n.createdAt)],
    }),
    db.query.noteMember.findMany({
      where: eq(tables.noteMember.userId, userId),
      orderBy: (m, { desc }) => [desc(m.createdAt)],
    }),
    db.query.label.findMany({
      where: eq(tables.label.userId, userId),
      orderBy: (l, { desc }) => [desc(l.order), desc(l.createdAt)],
    }),
    sharedNoteIds(userId),
  ]);
};

type Rows = Awaited<ReturnType<typeof loadRows>>;

const toEntries = ([owned, memberships, , shared]: Rows) => [
  ...owned.map((note) => ({
    id: note.id,
    role: "owner" as const,
    pinned: note.pinned,
    archived: note.archived,
    labelId: note.labelId,
    sortKey: note.sortKey,
    labelSortKey: note.labelSortKey,
    labelOrder: note.labelOrder ?? 0,
    reminderAt: note.reminderAt?.getTime() ?? null,
    preview: note.options?.preview ?? true,
    addedAt: note.createdAt.getTime(),
    shared: shared.has(note.id),
  })),
  ...memberships.map((member) => ({
    id: member.noteId,
    role: member.role,
    pinned: member.pinned,
    archived: member.archived,
    labelId: member.labelId,
    sortKey: member.sortKey,
    labelSortKey: member.labelSortKey,
    labelOrder: 0,
    reminderAt: member.reminderAt?.getTime() ?? null,
    preview: member.preview,
    addedAt: member.createdAt.getTime(),
    shared: true,
  })),
];

type Entry = ReturnType<typeof toEntries>[number];

const labelSortKeys = (entries: Entry[]) => {
  const keys = new Map<string, string>();
  const labelIds = new Set(
    entries.map((entry) => entry.labelId).filter(Boolean),
  );
  for (const labelId of labelIds) {
    const group = entries
      .filter((entry) => entry.labelId === labelId)
      .sort((a, b) => b.labelOrder - a.labelOrder)
      .map((entry) => ({ id: entry.id, sortKey: entry.labelSortKey }));
    for (const { id, sortKey } of withSortKeys(group)) keys.set(id, sortKey);
  }
  return keys;
};

const toWorkspaceNotes = (entries: Entry[]) => {
  const labelKeys = labelSortKeys(entries);
  return Object.fromEntries(
    withSortKeys(entries).map(({ id, labelOrder: _, ...entry }) => [
      id,
      {
        ...entry,
        labelSortKey: labelKeys.get(id) ?? null,
      } satisfies WorkspaceNote,
    ]),
  );
};

const toWorkspaceLabels = ([, , labels]: Rows) =>
  Object.fromEntries(
    withSortKeys(labels).map((label) => [
      label.id,
      {
        name: label.name,
        slug: label.slug,
        sortKey: label.sortKey,
        options: label.options ?? { preview: true },
        createdAt: label.createdAt.getTime(),
      } satisfies WorkspaceLabel,
    ]),
  );

export const buildWorkspaceSeed = async (
  userId: string,
): Promise<WorkspaceSnapshot> => {
  const rows = await loadRows(userId);
  return {
    notes: toWorkspaceNotes(toEntries(rows)),
    labels: toWorkspaceLabels(rows),
  };
};
