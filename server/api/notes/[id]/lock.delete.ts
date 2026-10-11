export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  await requireNoteRole(id, event.context.user.id, ["owner"]);
  await removeNoteLock(id);
  await publishNoteLock(id, await getNoteAudience(id), NO_LOCK);
  return { ok: true };
});
