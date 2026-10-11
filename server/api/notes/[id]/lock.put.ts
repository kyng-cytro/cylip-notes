import { notePasswordSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const userId = event.context.user.id;
  await requireNoteRole(id, userId, ["owner"]);
  const { password } = await readValidatedBody(event, notePasswordSchema.parse);
  const lockedAt = await setNoteLock(id, password);
  const audience = await getNoteAudience(id);
  await publishNoteLock(id, audience, await currentLockState(id));
  await Promise.all(audience.map((member) => disconnectFromNote(id, member)));
  return createUnlock({ noteId: id, userId, lockedAt });
});
