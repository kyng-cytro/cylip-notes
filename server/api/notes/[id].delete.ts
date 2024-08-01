export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  try {
    const db = useDrizzle();

    await db
      .delete(tables.note)
      .where(
        and(
          eq(tables.note.id, id),
          eq(tables.note.userId, event.context.user!.id),
        ),
      );
    return event.node.res.writeHead(200).end();
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to delete note. Note may not exist, or you don't have access to it.`,
    });
  }
});
