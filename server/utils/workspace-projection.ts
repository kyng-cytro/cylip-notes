import { compareKeys } from "@/lib/sync/ordering";
import { CONSTANTS } from "@/utils/helpers";
import { z } from "zod";

const backgroundSchema = z
  .object({
    type: z.enum(["image", "color"]).nullable(),
    value: z.string().min(1).nullable(),
  })
  .nullish();

const noteEntrySchema = z.object({
  pinned: z.boolean().catch(false),
  archived: z.boolean().catch(false),
  labelId: z.string().nullable().catch(null),
  sortKey: z.string().nullable().catch(null),
  labelSortKey: z.string().nullable().catch(null),
  reminderAt: z.number().nullable().catch(null),
  preview: z.boolean().catch(true),
});

const labelSchema = z.object({
  name: z.string().min(1).max(40),
  slug: z.string().min(1).max(60),
  sortKey: z.string(),
  options: z.object({
    preview: z.boolean().catch(true),
    background: backgroundSchema.catch(null),
  }),
  createdAt: z.number(),
});

export const workspaceSnapshotSchema = z.object({
  notes: z.record(z.string(), noteEntrySchema),
  labels: z.record(z.string(), labelSchema),
});

type Snapshot = z.infer<typeof workspaceSnapshotSchema>;
type SnapshotLabel = z.infer<typeof labelSchema>;
type NoteEntry = z.infer<typeof noteEntrySchema>;

const uniqueBySlug = (labels: [string, SnapshotLabel][]) => {
  const seen = new Set<string>();
  return labels.filter(([, label]) => {
    if (seen.has(label.slug)) return false;
    seen.add(label.slug);
    return true;
  });
};

const allowedLabels = async (userId: string, labels: Snapshot["labels"]) => {
  const user = await useDrizzle().query.user.findFirst({
    columns: { accountType: true },
    where: eq(tables.user.id, userId),
  });
  const sorted = Object.entries(labels).sort(([, a], [, b]) =>
    compareKeys(a.sortKey, b.sortKey),
  );
  const unique = uniqueBySlug(sorted);
  return user?.accountType === "premium"
    ? unique
    : unique.slice(0, CONSTANTS.maxFreeLabels);
};

const findAccessibleNotes = async (userId: string, noteIds: string[]) => {
  const db = useDrizzle();
  const [owned, shared] = await Promise.all([
    db.query.note.findMany({
      columns: { id: true },
      where: and(
        eq(tables.note.userId, userId),
        inArray(tables.note.id, noteIds),
      ),
    }),
    db.query.noteMember.findMany({
      columns: { noteId: true },
      where: and(
        eq(tables.noteMember.userId, userId),
        inArray(tables.noteMember.noteId, noteIds),
      ),
    }),
  ]);
  return {
    owned: new Set(owned.map((note) => note.id)),
    shared: new Set(shared.map((member) => member.noteId)),
  };
};

const deleteRemovedLabels = (userId: string, keepIds: string[]) =>
  useDrizzle()
    .delete(tables.label)
    .where(
      and(
        eq(tables.label.userId, userId),
        keepIds.length ? notInArray(tables.label.id, keepIds) : undefined,
      ),
    );

const upsertLabel = (userId: string, id: string, label: SnapshotLabel) => {
  const values = {
    name: label.name,
    slug: label.slug,
    sortKey: label.sortKey,
    options: {
      preview: label.options.preview,
      background: label.options.background ?? undefined,
    },
  };
  return useDrizzle()
    .insert(tables.label)
    .values({ id, userId, createdAt: new Date(label.createdAt), ...values })
    .onConflictDoUpdate({
      target: tables.label.id,
      set: values,
      setWhere: eq(tables.label.userId, userId),
    });
};

const noteValues = (entry: NoteEntry, labelIds: Set<string>) => ({
  pinned: entry.pinned,
  archived: entry.archived,
  labelId: entry.labelId && labelIds.has(entry.labelId) ? entry.labelId : null,
  sortKey: entry.sortKey,
  labelSortKey: entry.labelSortKey,
  reminderAt: entry.reminderAt ? new Date(entry.reminderAt) : null,
});

const updateOwnedNote = (
  userId: string,
  id: string,
  entry: NoteEntry,
  labelIds: Set<string>,
) =>
  useDrizzle()
    .update(tables.note)
    .set({
      ...noteValues(entry, labelIds),
      options: sql`json_set(coalesce(${tables.note.options}, '{}'), '$.preview', json(${JSON.stringify(entry.preview)}))`,
    })
    .where(and(eq(tables.note.id, id), eq(tables.note.userId, userId)));

const updateSharedNote = (
  userId: string,
  id: string,
  entry: NoteEntry,
  labelIds: Set<string>,
) =>
  useDrizzle()
    .update(tables.noteMember)
    .set({ ...noteValues(entry, labelIds), preview: entry.preview })
    .where(
      and(
        eq(tables.noteMember.noteId, id),
        eq(tables.noteMember.userId, userId),
      ),
    );

export const projectWorkspace = async (userId: string, snapshot: Snapshot) => {
  const labels = await allowedLabels(userId, snapshot.labels);
  const labelIds = new Set(labels.map(([id]) => id));
  const notes = Object.entries(snapshot.notes);
  const { owned, shared } = await findAccessibleNotes(
    userId,
    notes.map(([id]) => id),
  );

  await useDrizzle().batch([
    deleteRemovedLabels(userId, [...labelIds]),
    ...labels.map(([id, label]) => upsertLabel(userId, id, label)),
    ...notes
      .filter(([id]) => owned.has(id))
      .map(([id, entry]) => updateOwnedNote(userId, id, entry, labelIds)),
    ...notes
      .filter(([id]) => shared.has(id))
      .map(([id, entry]) => updateSharedNote(userId, id, entry, labelIds)),
  ]);
};
