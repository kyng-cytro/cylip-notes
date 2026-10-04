export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const role = await requireNoteRole(id, event.context.user.id);
  return listNotePeople(id, role === "owner");
});
