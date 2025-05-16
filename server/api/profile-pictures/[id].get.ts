export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  setHeader(event, "Content-Security-Policy", "default-src 'none';");
  return hubBlob().serve(event, `profile-pictures/${id}`);
});
