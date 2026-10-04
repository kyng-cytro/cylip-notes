import type { NoteRole } from "@/lib/sync/protocol";

type SharedRole = Exclude<NoteRole, "owner">;

type Sharer = { id: string; name: string; email: string };

export type NotePerson = { email: string; role: NoteRole };

const findUserByEmail = (email: string) =>
  useDrizzle().query.user.findFirst({
    columns: { id: true },
    where: eq(tables.user.email, email),
  });

const inviteFilter = (noteId: string, email: string) =>
  and(eq(tables.noteInvite.noteId, noteId), eq(tables.noteInvite.email, email));

const saveInvite = (
  noteId: string,
  email: string,
  role: SharedRole,
  invitedBy: string,
) =>
  useDrizzle()
    .insert(tables.noteInvite)
    .values({ noteId, email, role, invitedBy })
    .onConflictDoUpdate({
      target: [tables.noteInvite.noteId, tables.noteInvite.email],
      set: { role, invitedBy },
    });

const sendNoteSharedEmail = async (
  to: string,
  sharer: Sharer,
  noteId: string,
) => {
  const note = await useDrizzle().query.note.findFirst({
    columns: { title: true },
    where: eq(tables.note.id, noteId),
  });
  const url = `${useRuntimeConfig().public.baseUrl}/app/notes/${noteId}`;
  if (import.meta.dev) return console.log({ shared: url, to });
  const email = await renderNoteSharedEmail({
    sharer: { name: sharer.name || sharer.email },
    note: { title: note?.title || "Untitled note" },
    url,
  });
  await sendEmail({ ...email, to });
};

export const shareNote = async (
  noteId: string,
  sharer: Sharer,
  person: { email: string; role: SharedRole },
) => {
  if (person.email === sharer.email) {
    throw createError({ statusCode: 400, message: "You own this note." });
  }
  const recipient = await findUserByEmail(person.email);
  if (recipient) {
    await grantNoteAccess(noteId, recipient.id, person.role);
  } else {
    await saveInvite(noteId, person.email, person.role, sharer.id);
    await refreshSharedFlag(noteId);
  }
  await sendNoteSharedEmail(person.email, sharer, noteId);
};

const findCollaborator = async (noteId: string, email: string) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const role = await getNoteRole(noteId, user.id);
  return role && role !== "owner" ? user : null;
};

export const updateSharedRole = async (
  noteId: string,
  email: string,
  role: SharedRole,
) => {
  const collaborator = await findCollaborator(noteId, email);
  if (collaborator) return grantNoteAccess(noteId, collaborator.id, role);
  const updated = await useDrizzle()
    .update(tables.noteInvite)
    .set({ role })
    .where(inviteFilter(noteId, email))
    .returning({ email: tables.noteInvite.email });
  if (!updated.length) throw createError({ statusCode: 404 });
};

export const removeSharedAccess = async (noteId: string, email: string) => {
  await useDrizzle()
    .delete(tables.noteInvite)
    .where(inviteFilter(noteId, email));
  const collaborator = await findCollaborator(noteId, email);
  if (collaborator) await revokeNoteAccess(noteId, collaborator.id);
  else await refreshSharedFlag(noteId);
};

export const acceptNoteInvites = async (userId: string) => {
  const db = useDrizzle();
  const user = await db.query.user.findFirst({
    columns: { email: true },
    where: eq(tables.user.id, userId),
  });
  if (!user) return;
  const invites = await db.query.noteInvite.findMany({
    where: eq(tables.noteInvite.email, user.email.toLowerCase()),
  });
  for (const invite of invites) {
    await grantNoteAccess(invite.noteId, userId, invite.role);
    await db
      .delete(tables.noteInvite)
      .where(inviteFilter(invite.noteId, invite.email));
  }
};

export const listNotePeople = async (
  noteId: string,
  includeInvites: boolean,
): Promise<NotePerson[]> => {
  const note = await useDrizzle().query.note.findFirst({
    columns: {},
    where: eq(tables.note.id, noteId),
    with: {
      user: { columns: { email: true } },
      members: {
        columns: { role: true },
        with: { user: { columns: { email: true } } },
      },
      invites: { columns: { email: true, role: true } },
    },
  });
  if (!note) throw createError({ statusCode: 404 });
  const shared = [
    ...note.members.map(({ user, role }) => ({ email: user.email, role })),
    ...(includeInvites ? note.invites : []),
  ].sort((a, b) => a.email.localeCompare(b.email));
  return [{ email: note.user.email, role: "owner" }, ...shared];
};
