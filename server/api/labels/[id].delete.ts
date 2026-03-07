export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  try {
    const db = useDrizzle();
    const [label] = await db
      .delete(tables.label)
      .where(
        and(
          eq(tables.label.id, id),
          eq(tables.label.userId, event.context.user.id),
        ),
      )
      .returning({ id: tables.label.id });
    if (!label) {
      throw createError({
        statusCode: 404,
        message:
          "Failed to delete label. Label may not exist, or you don't have access to it.",
      });
    }
    return { success: true, id: label.id };
  } catch (e) {
    if (typeof e === "object" && e && "statusCode" in e) {
      throw e;
    }
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Could not delete label.",
    });
  }
});
