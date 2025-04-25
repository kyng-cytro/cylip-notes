export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const db = useDrizzle();
  try {
    const note = await db.query.note.findFirst({
      where: and(
        eq(tables.note.id, id),
        sql`json_extract(options, '$.public') = true`,
      ),
    });
    if (!note) {
      throw createError({
        statusCode: 404,
        statusMessage: "Note not found.",
      });
    }
    return {
      title: note.title,
      content: note.content,
    };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error.",
    });
  }
});
