import { labelReorderSchema } from "@/schemas/label";

export default defineAuthenticatedEventHandler(async (event) => {
  const { orderedIds } = await readValidatedBody(
    event,
    labelReorderSchema.parse,
  );
  try {
    const db = useDrizzle();
    const userId = event.context.user.id;
    const labels = await db.query.label.findMany({
      where: and(
        eq(tables.label.userId, userId),
        inArray(tables.label.id, orderedIds),
      ),
      columns: { id: true },
    });
    if (labels.length !== orderedIds.length) {
      throw createError({
        statusCode: 400,
        message: "One or more labels could not be reordered.",
      });
    }
    const total = orderedIds.length;
    await Promise.all(
      orderedIds.map((id, index) => {
        const rank = total - index;
        return db
          .update(tables.label)
          .set({ order: rank })
          .where(and(eq(tables.label.id, id), eq(tables.label.userId, userId)));
      }),
    );
    return { success: true };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Failed to reorder labels.",
    });
  }
});
