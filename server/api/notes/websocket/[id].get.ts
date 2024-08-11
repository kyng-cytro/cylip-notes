export default defineWebsocketEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const db = useDrizzle();
  try {
    const note = await db.query.note.findFirst({
      columns: { id: true, content: true },
      where: eq(tables.note.id, id),
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
