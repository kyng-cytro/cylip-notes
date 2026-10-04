export default defineAuthenticatedEventHandler(async (event) => {
  const form = await readFormData(event);
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, message: "Missing image file." });
  }
  ensureBlob(file, { maxSize: "1MB", types: ["image"] });
  return { url: await putNoteImage(event.context.user.id, file) };
});
