import type { NoteRole, SharedRole } from "@/lib/sync/protocol";
import { CONSTANTS } from "@/utils/helpers";

const UNTITLED_NOTE = "Untitled note";

type Sharer = {
  id: string;
  name: string;
  email: string;
  accountType: keyof typeof CONSTANTS.maxSharedPeople;
};

type Recipient = { id: string; email: string };

export type NotePerson = { email: string; role: NoteRole };

export type PendingInvite = {
  noteId: string;
  role: SharedRole;
  note: { title: string };
  sharer: { name: string; email: string };
};

const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many;

const emailKey = (email: string) => email.trim().toLowerCase();

const displayName = (user: { name: string | null; email: string }) =>
  user.name || user.email;

const findUserByEmail = (email: string) =>
  useDrizzle().query.user.findFirst({
    columns: { id: true },
    where: eq(sql`lower(${tables.user.email})`, email),
  });

const findCollaborator = async (noteId: string, email: string) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const role = await getNoteRole(noteId, user.id);
  return role && role !== "owner" ? user : null;
};

const inviteFilter = (noteId: string, email: string) =>
  and(eq(tables.noteInvite.noteId, noteId), eq(tables.noteInvite.email, email));

const notifyRecipient = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) return;
  await notifyInvitesChanged(user.id).catch((error) =>
    console.error("Failed to notify invite recipient", error),
  );
};

const updateInviteRole = async (
  noteId: string,
  email: string,
  role: SharedRole,
) => {
  const updated = await useDrizzle()
    .update(tables.noteInvite)
    .set({ role })
    .where(inviteFilter(noteId, email))
    .returning({ email: tables.noteInvite.email });
  if (updated.length) await notifyRecipient(email);
  return updated.length > 0;
};

const deleteInvite = async (noteId: string, email: string) => {
  const deleted = await useDrizzle()
    .delete(tables.noteInvite)
    .where(inviteFilter(noteId, email))
    .returning({ email: tables.noteInvite.email });
  return deleted.length > 0;
};

const assertCanInvite = async (noteId: string, sharer: Sharer) => {
  const db = useDrizzle();
  const limit = CONSTANTS.maxSharedPeople[sharer.accountType];
  const plan = sharer.accountType === "premium" ? "Premium" : "Free";
  const [members, noteInvites, pendingInvites] = await Promise.all([
    db.$count(tables.noteMember, eq(tables.noteMember.noteId, noteId)),
    db.$count(tables.noteInvite, eq(tables.noteInvite.noteId, noteId)),
    db.$count(tables.noteInvite, eq(tables.noteInvite.invitedBy, sharer.id)),
  ]);
  if (members + noteInvites >= limit) {
    throw createError({
      statusCode: 403,
      message: `${plan} accounts can share a note with up to ${limit} ${plural(limit, "person", "people")}.`,
    });
  }
  if (pendingInvites >= limit) {
    throw createError({
      statusCode: 403,
      message: `${plan} accounts can have ${limit} pending ${plural(limit, "invite", "invites")} at a time. Wait for one to be accepted or cancel it.`,
    });
  }
};

const sendInviteEmail = async (to: string, sharer: Sharer, noteId: string) => {
  const note = await useDrizzle().query.note.findFirst({
    columns: { title: true },
    where: eq(tables.note.id, noteId),
  });
  const url = `${useRuntimeConfig().public.baseUrl}/app`;
  if (import.meta.dev) return console.log({ invited: to, url });
  const email = await renderNoteSharedEmail({
    sharer: { name: displayName(sharer), email: sharer.email },
    note: { title: note?.title || UNTITLED_NOTE },
    url,
  });
  await sendEmail({ ...email, to });
};

export const shareNote = async (
  noteId: string,
  sharer: Sharer,
  person: { email: string; role: SharedRole },
) => {
  const email = emailKey(person.email);
  const { role } = person;
  if (email === emailKey(sharer.email)) {
    throw createError({ statusCode: 400, message: "You own this note." });
  }
  const collaborator = await findCollaborator(noteId, email);
  if (collaborator) return grantNoteAccess(noteId, collaborator.id, role);
  if (await updateInviteRole(noteId, email, role)) return;
  await assertCanInvite(noteId, sharer);
  await useDrizzle()
    .insert(tables.noteInvite)
    .values({ noteId, email, role, invitedBy: sharer.id });
  await refreshSharedFlag(noteId);
  await Promise.all([
    notifyRecipient(email),
    sendInviteEmail(email, sharer, noteId),
  ]);
};

export const updateSharedRole = async (
  noteId: string,
  personEmail: string,
  role: SharedRole,
) => {
  const email = emailKey(personEmail);
  const collaborator = await findCollaborator(noteId, email);
  if (collaborator) return grantNoteAccess(noteId, collaborator.id, role);
  if (!(await updateInviteRole(noteId, email, role))) {
    throw createError({ statusCode: 404 });
  }
};

export const removeSharedAccess = async (
  noteId: string,
  personEmail: string,
) => {
  const email = emailKey(personEmail);
  if (await deleteInvite(noteId, email)) {
    await refreshSharedFlag(noteId);
    await notifyRecipient(email);
    return;
  }
  const collaborator = await findCollaborator(noteId, email);
  if (collaborator) await revokeNoteAccess(noteId, collaborator.id);
};

export const acceptInvite = async (noteId: string, recipient: Recipient) => {
  const email = emailKey(recipient.email);
  const invite = await useDrizzle().query.noteInvite.findFirst({
    columns: { role: true },
    where: inviteFilter(noteId, email),
  });
  if (!invite) throw createError({ statusCode: 404 });
  await grantNoteAccess(noteId, recipient.id, invite.role);
  await deleteInvite(noteId, email);
};

export const declineInvite = async (noteId: string, recipient: Recipient) => {
  if (!(await deleteInvite(noteId, emailKey(recipient.email)))) {
    throw createError({ statusCode: 404 });
  }
  await refreshSharedFlag(noteId);
};

export const listPendingInvites = async (
  email: string,
): Promise<PendingInvite[]> => {
  const invites = await useDrizzle().query.noteInvite.findMany({
    columns: { noteId: true, role: true },
    where: eq(tables.noteInvite.email, emailKey(email)),
    with: {
      note: { columns: { title: true } },
      inviter: { columns: { name: true, email: true } },
    },
    orderBy: (invite, { desc }) => [desc(invite.createdAt)],
  });
  return invites.map(({ noteId, role, note, inviter }) => ({
    noteId,
    role,
    note: { title: note.title || UNTITLED_NOTE },
    sharer: { name: displayName(inviter), email: inviter.email },
  }));
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
