export default defineAuthenticatedEventHandler(async (event) => {
  await declineInvite(getRouterParam(event, "noteId")!, event.context.user);
  return { ok: true };
});
