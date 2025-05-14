import { generateId } from "lucia";
import { notePostSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const { labelId } = await readValidatedBody(event, notePostSchema.parse);
    const id = generateId(15);

    const label =
      labelId && labelId !== "all-notes"
        ? await db.query.label.findFirst({
            where: eq(tables.label.id, labelId),
          })
        : null;

    await db.insert(tables.note).values({
      id,
      userId: event.context.user.id,
      labelId: label?.id || null,
      options: label?.options
        ? { ...label.options, public: false }
        : { preview: true, public: false },
    });

    const note = await db.query.note.findFirst({
      where: eq(tables.note.id, id),
      with: { label: true },
    });
    if (!note)
      throw createError({ statusCode: 500, message: "Failed to create note." });
    return note;
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to create note.`,
    });
  }
});
