export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const versionId = getRouterParam(event, "versionId")!;
  const { user } = event.context;
  await requireNoteHistory(event, id, user.id);
  return showNoteVersion(id, versionId, user.accountType);
});
