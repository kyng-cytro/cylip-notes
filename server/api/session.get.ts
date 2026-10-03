export default defineEventHandler((event) => ({
  token: event.context.session?.token ?? null,
}));
