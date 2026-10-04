export default defineAuthenticatedEventHandler(async (event) => {
  await acceptInvite(getRouterParam(event, "noteId")!, event.context.user);
  return { ok: true };
});
