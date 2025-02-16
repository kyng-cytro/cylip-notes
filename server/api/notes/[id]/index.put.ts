import { notePutSchema } from "@/schemas/note";
import { slugify } from "@/utils/helpers";

export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }

  const { field, value } = await readValidatedBody(event, notePutSchema.parse);

  try {
    const db = useDrizzle();

    const data = {
      ...(field === "title" && { title: value, slug: slugify(value) }),
      ...(field === "content" && { content: value }),
      updatedAt: new Date(),
    };

    await db
      .update(tables.note)
      .set(data)
      .where(
        and(
          eq(tables.note.id, id),
          eq(tables.note.userId, event.context.user!.id),
        ),
      );

    const note = await db.query.note.findFirst({
      where: and(
        eq(tables.note.id, id),
        eq(tables.note.userId, event.context.user!.id),
      ),
      with: { label: true },
    });

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
