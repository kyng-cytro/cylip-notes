export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const userId = getRouterParam(event, "userId")!;
  const isLeaving = userId === event.context.user.id;
  await requireNoteRole(
    id,
    event.context.user.id,
    isLeaving ? ["editor", "viewer"] : ["owner"],
  );
  await revokeNoteAccess(id, userId);
  return { ok: true };
});
