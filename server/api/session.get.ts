export default defineEventHandler((event) => ({
  token: event.context.session?.token ?? null,
  userId: event.context.user?.id ?? null,
}));
