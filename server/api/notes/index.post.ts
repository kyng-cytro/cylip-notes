import { generateId } from "lucia";
import { notePostSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const { labelId } = await readValidatedBody(event, notePostSchema.parse);
    const id = generateId(15);
    await db.insert(tables.note).values({
      id,
      userId: event.context.user!.id,
      ...(labelId && labelId !== "all-notes" && { labelId }),
    });
    const note = await db.query.note.findFirst({
      where: eq(tables.note.id, id),
      with: { label: true, settings: true },
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
