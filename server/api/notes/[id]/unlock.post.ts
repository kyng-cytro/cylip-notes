import { noteUnlockSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const userId = event.context.user.id;
  await requireNoteRole(id, userId);
  const { password } = await readValidatedBody(event, noteUnlockSchema.parse);
  const lock = await getNoteLock(id);
  if (!lock) {
    throw createError({ statusCode: 400, message: "This note isn't locked." });
  }
  await requireNotePassword(`${id}:${userId}`, lock.passwordHash, password);
  return createUnlock({
    noteId: id,
    userId,
    lockedAt: lock.lockedAt.getTime(),
  });
});
