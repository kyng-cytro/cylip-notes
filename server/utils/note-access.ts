import type { NoteRole } from "@/lib/sync/protocol";

const getAudiences = async (noteIds: string[]) => {
  const db = useDrizzle();
  const [notes, members] = await Promise.all([
    db.query.note.findMany({
      columns: { id: true, userId: true },
      where: inArray(tables.note.id, noteIds),
    }),
    db.query.noteMember.findMany({
      columns: { noteId: true, userId: true },
      where: inArray(tables.noteMember.noteId, noteIds),
    }),
  ]);
  return [
    ...notes.map((note) => ({ noteId: note.id, userId: note.userId })),
    ...members,
  ];
};

const removeFromWorkspaces = (audience: { noteId: string; userId: string }[]) =>
  Promise.allSettled(
    audience.map(({ noteId, userId }) =>
      callSyncWorker(
        `/internal/workspaces/${userId}/notes/${noteId}`,
        "DELETE",
      ),
    ),
  );

export const deleteNotes = async (noteIds: string[]) => {
  if (!noteIds.length) return;
  const audience = await getAudiences(noteIds);
  const db = useDrizzle();
  await db.batch([
    db
      .insert(tables.deletedNote)
      .values(noteIds.map((id) => ({ id })))
      .onConflictDoNothing(),
    db.delete(tables.note).where(inArray(tables.note.id, noteIds)),
  ]);
  await Promise.allSettled(
    noteIds.map((id) => callSyncWorker(`/internal/notes/${id}`, "DELETE")),
  );
  await removeFromWorkspaces(audience);
};

export const grantNoteAccess = async (
  noteId: string,
  userId: string,
  role: Exclude<NoteRole, "owner">,
) => {
  await useDrizzle()
    .insert(tables.noteMember)
    .values({ noteId, userId, role })
    .onConflictDoUpdate({
      target: [tables.noteMember.noteId, tables.noteMember.userId],
      set: { role },
    });
  await callSyncWorker(
    `/internal/workspaces/${userId}/notes/${noteId}`,
    "POST",
    { role },
  );
  await callSyncWorker(
    `/internal/notes/${noteId}/connections/${userId}`,
    "DELETE",
  );
};

export const revokeNoteAccess = async (noteId: string, userId: string) => {
  await useDrizzle()
    .delete(tables.noteMember)
    .where(
      and(
        eq(tables.noteMember.noteId, noteId),
        eq(tables.noteMember.userId, userId),
      ),
    );
  await removeFromWorkspaces([{ noteId, userId }]);
  await callSyncWorker(
    `/internal/notes/${noteId}/connections/${userId}`,
    "DELETE",
  );
};

export const requireNoteRole = async (
  noteId: string,
  userId: string,
  allowed: NoteRole[],
) => {
  const role = await getNoteRole(noteId, userId);
  if (!role || !allowed.includes(role)) {
    throw createError({
      statusCode: 403,
      message: "You can't do that on this note.",
    });
  }
  return role;
};
