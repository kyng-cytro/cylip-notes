export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const db = useDrizzle();
  try {
    const note = await db.query.note.findFirst({
      where: and(
        eq(tables.note.id, id),
        eq(tables.note.userId, event.context.user.id),
      ),
      with: { user: true, label: true },
    });
    if (!note) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found.",
      });
    }
    return note;
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error.",
    });
  }
});
