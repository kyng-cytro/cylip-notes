import { notePatchSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const { field, value } = await readValidatedBody(
    event,
    notePatchSchema.parse,
  );
  try {
    const db = useDrizzle();

    const data = {
      ...(field === "showPreview" && { showPreview: value }),
      ...(field === "pinned" && { pinned: value, archived: false }),
      ...(field === "archived" && { archived: value, pinned: false }),
      ...(field === "trashed" && {
        trashed: value,
        pinned: false,
        archived: false,
        trashedAt: value ? sql`current_timestamp` : null,
      }),
      updatedAt: sql`current_timestamp`,
    };

    const [note] = await db
      .update(tables.note)
      .set(data)
      .where(
        and(
          eq(tables.note.id, id),
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

    return note;
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to modify note. Note may not exist, or you don't have access to it.`,
    });
  }
});
