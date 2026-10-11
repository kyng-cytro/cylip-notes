import { noteUnlockSchema } from "@/schemas/note";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const note = await findPublicNote(id);
  const lock = await getNoteLock(id);
  if (lock) {
    const { password } = await readValidatedBody(event, noteUnlockSchema.parse);
    const visitor = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
    await requireNotePassword(`${id}:${visitor}`, lock.passwordHash, password);
  }
  return { content: note.content };
});
