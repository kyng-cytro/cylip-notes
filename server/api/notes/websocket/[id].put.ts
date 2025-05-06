import { noteWebsocketPutSchema } from "@/schemas/note";

export default defineWebsocketEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }

  const { content } = await readValidatedBody(
    event,
    noteWebsocketPutSchema.parse,
  );

  try {
    const db = useDrizzle();
    const data = {
      content,
      updatedAt: new Date(),
    };

    const [note] = await db
      .update(tables.note)
      .set(data)
      .where(
        and(
          eq(tables.note.id, id),
          eq(tables.note.trashed, false),
          eq(tables.note.userId, event.context.user!.id),
        ),
      )
      .returning();

    if (!note) {
      throw createError({
        statusCode: 404,
        message:
          "Failed to modify note. Note may not exist, or you don't have access to it.",
      });
    }
    return setResponseStatus(event, 200);
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to modify note. Note may not exist, or you don't have access to it.`,
    });
  }
});
