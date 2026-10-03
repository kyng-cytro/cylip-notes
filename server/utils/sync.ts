import type { NoteRole } from "@/lib/sync/protocol";
import type { H3Event } from "h3";

export const requireSyncSecret = (event: H3Event) => {
  if (getHeader(event, "x-sync-secret") !== useRuntimeConfig().sync.secret) {
    throw createError({ statusCode: 401, message: "Invalid sync secret." });
  }
};

export const callSyncWorker = (
  path: string,
  method: "POST" | "DELETE",
  body?: Record<string, unknown>,
) => {
  const { url, secret } = useRuntimeConfig().sync;
  return $fetch(path, {
    baseURL: url,
    method,
    body,
    headers: { "x-sync-secret": secret },
  });
};

export const getUserFromToken = async (token: string) => {
  const session = await useDrizzle().query.session.findFirst({
    columns: { expiresAt: true },
    where: eq(tables.session.token, token),
    with: { user: { columns: { id: true, name: true } } },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    throw createError({ statusCode: 401, message: "Invalid session." });
  }
  return session.user;
};

export const getNoteRole = async (
  noteId: string,
  userId: string,
): Promise<NoteRole | null> => {
  const db = useDrizzle();
  const note = await db.query.note.findFirst({
    columns: { userId: true },
    where: eq(tables.note.id, noteId),
  });
  if (!note) return null;
  if (note.userId === userId) return "owner";
  const member = await db.query.noteMember.findFirst({
    columns: { role: true },
    where: and(
      eq(tables.noteMember.noteId, noteId),
      eq(tables.noteMember.userId, userId),
    ),
  });
  return member?.role ?? null;
};

export const isDeletedNote = async (noteId: string) => {
  const tombstone = await useDrizzle().query.deletedNote.findFirst({
    where: eq(tables.deletedNote.id, noteId),
  });
  return !!tombstone;
};

export const claimNotes = async (ids: string[], userId: string) => {
  if (!ids.length) return [];
  const rows = await useDrizzle()
    .insert(tables.note)
    .values(ids.map((id) => ({ id, userId })))
    .onConflictDoNothing()
    .returning({ id: tables.note.id });
  return rows.map((row) => row.id);
};
