export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid id.",
    });
  }

  try {
    const db = useDrizzle();

    return await db.query.user.findFirst({
      where: eq(tables.user.id, id),
      with: {
        labels: true,
      },
    });
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error.",
    });
  }
});
