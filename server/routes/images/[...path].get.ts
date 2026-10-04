export default defineEventHandler(async (event) => {
  const image = await getNoteImage(getRouterParam(event, "path")!);
  if (!image) throw createError({ statusCode: 404 });
  setHeader(event, "Content-Type", image.type);
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  setHeader(event, "Content-Security-Policy", "default-src 'none';");
  return image;
});
