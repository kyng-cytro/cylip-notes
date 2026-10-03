import { z } from "zod";

const bodySchema = z.object({
  token: z.string().min(1),
  kind: z.enum(["note", "workspace"]),
  id: z.string().min(1).max(64),
});

const authorizeWorkspace = (user: { id: string; name: string }, id: string) => {
  if (id !== user.id) throw createError({ statusCode: 403 });
  return { userId: user.id, name: user.name, role: "owner", created: false };
};

const authorizeNote = async (
  user: { id: string; name: string },
  id: string,
) => {
  if (await isDeletedNote(id)) throw createError({ statusCode: 410 });
  const role = await getNoteRole(id, user.id);
  if (role) return { userId: user.id, name: user.name, role, created: false };
  const [claimed] = await claimNotes([id], user.id);
  if (!claimed) throw createError({ statusCode: 403 });
  return { userId: user.id, name: user.name, role: "owner", created: true };
};

export default defineSyncEventHandler(async (event) => {
  const { token, kind, id } = await readValidatedBody(event, bodySchema.parse);
  const user = await getUserFromToken(token);
  return kind === "workspace"
    ? authorizeWorkspace(user, id)
    : authorizeNote(user, id);
});
