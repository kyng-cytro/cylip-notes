import {
  NOTE_ROLES,
  type NoteRole,
  type SharedRole,
} from "@/lib/sync/protocol";

type Membership = { noteId: string; userId: string };

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

export const requireNoteRole = async (
  noteId: string,
  userId: string,
  allowed: readonly NoteRole[] = NOTE_ROLES,
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

export const isDeletedNote = async (noteId: string) => {
  const tombstone = await useDrizzle().query.deletedNote.findFirst({
    where: eq(tables.deletedNote.id, noteId),
  });
  return !!tombstone;
};

export const claimNotes = async (noteIds: string[], userId: string) => {
  if (!noteIds.length) return [];
  const rows = await useDrizzle()
    .insert(tables.note)
    .values(noteIds.map((id) => ({ id, userId })))
    .onConflictDoNothing()
    .returning({ id: tables.note.id });
  return rows.map((row) => row.id);
};

const getMemberships = async (noteIds: string[]): Promise<Membership[]> => {
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

export const deleteNotes = async (noteIds: string[]) => {
  if (!noteIds.length) return;
  const memberships = await getMemberships(noteIds);
  const db = useDrizzle();
  await db.batch([
    db
      .insert(tables.deletedNote)
      .values(noteIds.map((id) => ({ id })))
      .onConflictDoNothing(),
    db.delete(tables.note).where(inArray(tables.note.id, noteIds)),
  ]);
  await Promise.allSettled([
    ...noteIds.map(destroyNoteDoc),
    ...memberships.map(({ noteId, userId }) =>
      removeFromWorkspace(userId, noteId),
    ),
  ]);
};

export const refreshSharedFlag = async (noteId: string) => {
  const db = useDrizzle();
  const [note, member, invite] = await Promise.all([
    db.query.note.findFirst({
      columns: { userId: true },
      where: eq(tables.note.id, noteId),
    }),
    db.query.noteMember.findFirst({
      columns: { userId: true },
      where: eq(tables.noteMember.noteId, noteId),
    }),
    db.query.noteInvite.findFirst({
      columns: { email: true },
      where: eq(tables.noteInvite.noteId, noteId),
    }),
  ]);
  if (note) {
    await setWorkspaceNoteShared(note.userId, noteId, !!(member || invite));
  }
};

export const grantNoteAccess = async (
  noteId: string,
  userId: string,
  role: SharedRole,
) => {
  await useDrizzle()
    .insert(tables.noteMember)
    .values({ noteId, userId, role })
    .onConflictDoUpdate({
      target: [tables.noteMember.noteId, tables.noteMember.userId],
      set: { role },
    });
  await addToWorkspace(userId, noteId, role);
  await disconnectFromNote(noteId, userId);
  await refreshSharedFlag(noteId);
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
  await removeFromWorkspace(userId, noteId);
  await disconnectFromNote(noteId, userId);
  await refreshSharedFlag(noteId);
};
