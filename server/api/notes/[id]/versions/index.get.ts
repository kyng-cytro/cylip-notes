export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const { user } = event.context;
  await requireNoteHistory(event, id, user.id);
  return listNoteVersions(id, user.accountType);
});
