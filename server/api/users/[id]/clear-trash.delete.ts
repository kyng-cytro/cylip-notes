export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  if (id !== event.context.user.id) {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to access this resource",
    });
  }
  try {
    const db = useDrizzle();

    await db
      .delete(tables.note)
      .where(and(eq(tables.note.trashed, true), eq(tables.note.userId, id)));
    return setResponseStatus(event, 200);
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to delete trashed notes. Note may not exist, or you don't have access to it.`,
    });
  }
});
