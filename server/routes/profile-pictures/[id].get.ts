export default defineEventHandler(async (event) => {
  const picture = await getProfilePicture(getRouterParam(event, "id")!);
  if (!picture) throw createError({ statusCode: 404 });
  setHeader(event, "Content-Type", picture.type);
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  setHeader(event, "Content-Security-Policy", "default-src 'none';");
  return Buffer.from(picture.data);
});
