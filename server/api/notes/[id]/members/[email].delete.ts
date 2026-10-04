export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const email = getRouterParam(event, "email", { decode: true })!;
  const { user } = event.context;
  const isLeaving = email.toLowerCase() === user.email.toLowerCase();
  await requireNoteRole(
    id,
    user.id,
    isLeaving ? ["editor", "viewer"] : ["owner"],
  );
  await removeSharedAccess(id, email);
  return { ok: true };
});
