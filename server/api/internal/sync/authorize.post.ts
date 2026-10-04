import type { NoteRole } from "@/lib/sync/protocol";
import { z } from "zod";

type User = { id: string; name: string };

const bodySchema = z.object({
  token: z.string().min(1),
  kind: z.enum(["note", "workspace"]),
  id: z.string().min(1).max(64),
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

const authorizeNote = async (user: User, noteId: string) => {
  if (await isDeletedNote(noteId)) throw createError({ statusCode: 410 });
  const role = await getNoteRole(noteId, user.id);
  if (role) return identity(user, role);
  const [claimed] = await claimNotes([noteId], user.id);
  if (!claimed) throw createError({ statusCode: 403 });
  return identity(user, "owner", true);
};

export default defineSyncEventHandler(async (event) => {
  const { token, kind, id } = await readValidatedBody(event, bodySchema.parse);
  const user = await getUserFromToken(token);
  return kind === "workspace"
    ? authorizeWorkspace(user, id)
    : authorizeNote(user, id);
});
