import type { NoteRole } from "@/lib/sync/protocol";
import { z } from "zod";

const bodySchema = z.object({
  token: z.string().min(1),
  ids: z.array(z.string().min(1).max(64)).max(5000),
  create: z.boolean().default(false),
  since: z.number().nullish(),
});

const loadAccess = (ids: string[], userId: string) => {
  const db = useDrizzle();
  return Promise.all([
    db.query.note.findMany({
      columns: { id: true, userId: true, updatedAt: true },
      where: inArray(tables.note.id, ids),
    }),
    db.query.noteMember.findMany({
      columns: { noteId: true, role: true },
      where: and(
        eq(tables.noteMember.userId, userId),
        inArray(tables.noteMember.noteId, ids),
      ),
    }),
    db.query.deletedNote.findMany({
      columns: { id: true },
      where: inArray(tables.deletedNote.id, ids),
    }),
  ]);
};

export default defineSyncEventHandler(async (event) => {
  const { token, ids, create, since } = await readValidatedBody(
    event,
    bodySchema.parse,
  );
  const user = await getUserFromToken(token);
  const cursor = Date.now();
  const roles: Record<string, NoteRole> = {};
  const changed: string[] = [];
  const denied: string[] = [];
  const created: string[] = [];
  if (!ids.length)
    return { userId: user.id, roles, changed, denied, created, cursor };

  const [notes, memberships, tombstones] = await loadAccess(ids, user.id);
  const memberRoles = new Map(memberships.map((m) => [m.noteId, m.role]));

  for (const note of notes) {
    const role = note.userId === user.id ? "owner" : memberRoles.get(note.id);
    if (!role) {
      denied.push(note.id);
      continue;
    }
    roles[note.id] = role;
    if (!since || note.updatedAt.getTime() > since) changed.push(note.id);
  }
  denied.push(...tombstones.map((t) => t.id));

  if (create) {
    const known = new Set([...notes.map((n) => n.id), ...denied]);
    created.push(
      ...(await claimNotes(
        ids.filter((id) => !known.has(id)),
        user.id,
      )),
    );
    for (const id of created) roles[id] = "owner";
  }

  return { userId: user.id, roles, changed, denied, created, cursor };
});
