export default defineAuthenticatedEventHandler((event) =>
  listPendingInvites(event.context.user.email),
);
