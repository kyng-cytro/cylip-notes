import type { NoteRole } from "@/lib/sync/protocol";
import { z } from "zod";

type User = { id: string; name: string };

const bodySchema = z.object({
  token: z.string().min(1),
  kind: z.enum(["note", "workspace"]),
  id: z.string().min(1).max(64),
  unlock: z.string().optional(),
});

const identity = (user: User, role: NoteRole, created = false) => ({
  userId: user.id,
  name: user.name,
  role,
  created,
});

const authorizeWorkspace = (user: User, userId: string) => {
  if (userId !== user.id) throw createError({ statusCode: 403 });
  return identity(user, "owner");
};

const requireUnlocked = async (
  noteId: string,
  userId: string,
  unlock?: string,
) => {
  const lock = await getNoteLock(noteId);
  if (!lock) return;
  const claims = { noteId, userId, lockedAt: lock.lockedAt.getTime() };
  if (!(await isValidUnlockToken(unlock, claims))) {
    throw createError({ statusCode: 423 });
  }
};

const authorizeNote = async (user: User, noteId: string, unlock?: string) => {
  if (await isDeletedNote(noteId)) throw createError({ statusCode: 410 });
  const role = await getNoteRole(noteId, user.id);
  if (role) {
    await requireUnlocked(noteId, user.id, unlock);
    return identity(user, role);
  }
  const [claimed] = await claimNotes([noteId], user.id);
  if (!claimed) throw createError({ statusCode: 403 });
  return identity(user, "owner", true);
};

export default defineSyncEventHandler(async (event) => {
  const { token, kind, id, unlock } = await readValidatedBody(
    event,
    bodySchema.parse,
  );
  const user = await getUserFromToken(token);
  return kind === "workspace"
    ? authorizeWorkspace(user, id)
    : authorizeNote(user, id, unlock);
});
