import type { NoteRole } from "@/lib/sync/protocol";
import { z } from "zod";

const bodySchema = z.object({
  token: z.string().min(1),
  ids: z.array(z.string().min(1).max(64)).max(5000),
  create: z.boolean().default(false),
  since: z.number().nullish(),
  unlocks: z.record(z.string(), z.string()).default({}),
});

const loadAccess = (noteIds: string[], userId: string) => {
  const db = useDrizzle();
  return Promise.all([
    db.query.note.findMany({
      columns: { id: true, userId: true, updatedAt: true },
      where: inArray(tables.note.id, noteIds),
    }),
    db.query.noteMember.findMany({
      columns: { noteId: true, role: true },
      where: and(
        eq(tables.noteMember.userId, userId),
        inArray(tables.noteMember.noteId, noteIds),
      ),
    }),
    db.query.deletedNote.findMany({
      columns: { id: true },
      where: inArray(tables.deletedNote.id, noteIds),
    }),
  ]);
};

type Access = Awaited<ReturnType<typeof loadAccess>>;

const resolveRoles = ([notes, memberships]: Access, userId: string) => {
  const memberRoles = new Map(memberships.map((m) => [m.noteId, m.role]));
  return new Map(
    notes.map((note) => [
      note.id,
      note.userId === userId ? ("owner" as const) : memberRoles.get(note.id),
    ]),
  );
};

const lockedWithoutAccess = async (
  roles: Record<string, NoteRole>,
  userId: string,
  unlocks: Record<string, string>,
) => {
  const locks = await getNoteLocks(Object.keys(roles));
  const checks = await Promise.all(
    [...locks].map(async ([noteId, lockedAt]) => {
      const claims = { noteId, userId, lockedAt };
      const valid = await isValidUnlockToken(unlocks[noteId], claims);
      return valid ? null : noteId;
    }),
  );
  return checks.filter((noteId) => noteId !== null);
};

export default defineSyncEventHandler(async (event) => {
  const { token, ids, create, since, unlocks } = await readValidatedBody(
    event,
    bodySchema.parse,
  );
  const user = await getUserFromToken(token);
  const cursor = Date.now();
  const access = await loadAccess(ids, user.id);
  const [notes, , tombstones] = access;
  const noteRoles = resolveRoles(access, user.id);

  const roles: Record<string, NoteRole> = {};
  for (const [id, role] of noteRoles) if (role) roles[id] = role;
  for (const id of await lockedWithoutAccess(roles, user.id, unlocks)) {
    delete roles[id];
  }
  const denied = [
    ...[...noteRoles].filter(([, role]) => !role).map(([id]) => id),
    ...tombstones.map((tombstone) => tombstone.id),
  ];
  const changed = notes
    .filter(
      (note) => roles[note.id] && (!since || note.updatedAt.getTime() > since),
    )
    .map((note) => note.id);

  const known = new Set([...noteRoles.keys(), ...denied]);
  const unknown = ids.filter((id) => !known.has(id));
  const created = create ? await claimNotes(unknown, user.id) : [];
  for (const id of created) roles[id] = "owner";

  return { userId: user.id, roles, changed, denied, created, cursor };
});
