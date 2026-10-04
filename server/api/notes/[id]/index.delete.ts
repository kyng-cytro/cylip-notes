export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const userId = event.context.user.id;
  const role = await requireNoteRole(id, userId);
  if (role === "owner") await deleteNotes([id]);
  else await revokeNoteAccess(id, userId);
  return { ok: true };
});
