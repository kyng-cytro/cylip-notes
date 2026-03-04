import { noteReorderSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const { scope, labelId, orderedIds } = await readValidatedBody(
    event,
    noteReorderSchema.parse,
  );

  try {
    const db = useDrizzle();
    const userId = event.context.user.id;

    if (scope === "label" && labelId) {
      const label = await db.query.label.findFirst({
        where: and(eq(tables.label.id, labelId), eq(tables.label.userId, userId)),
      });

      if (!label) {
        throw createError({
          statusCode: 404,
          message: "Label not found for this user.",
        });
      }
    }

    const whereConditions = [
      eq(tables.note.userId, userId),
      inArray(tables.note.id, orderedIds),
      ...(scope === "label" && labelId
        ? [eq(tables.note.labelId, labelId)]
        : []),
    ];

    const notes = await db.query.note.findMany({
      where: and(...whereConditions),
      columns: { id: true },
    });

    if (notes.length !== orderedIds.length) {
      throw createError({
        statusCode: 400,
        message: "One or more notes could not be reordered in this scope.",
      });
    }

    const total = orderedIds.length;

    await Promise.all(
      orderedIds.map((id, index) => {
        const rank = total - index;
        const updateData =
          scope === "label" ? { labelOrder: rank } : { globalOrder: rank };

        return db
          .update(tables.note)
          .set(updateData)
          .where(
            and(
              eq(tables.note.id, id),
              eq(tables.note.userId, userId),
              ...(scope === "label" && labelId
                ? [eq(tables.note.labelId, labelId)]
                : []),
            ),
          );
      }),
    );

    return { success: true };
  } catch (e) {
    if (typeof e === "object" && e && "statusCode" in e) {
      throw e;
    }
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Failed to reorder notes.",
    });
  }
});
