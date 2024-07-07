export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid id.",
    });
  }
  if (id !== event.context.user!.id) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Forbidden. You do not have permission to access this resource.",
    });
  }
  const db = useDrizzle();
  try {
    return await db.query.user.findFirst({
      where: eq(tables.user.id, id),
      with: {
        notes: true,
        labels: {
          orderBy: (labels, { desc }) => [desc(labels.createdAt)],
        },
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
