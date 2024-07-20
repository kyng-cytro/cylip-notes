import { generateId } from "lucia";

export default defineAuthenticatedEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const id = generateId(15);
    const [note] = await db
      .insert(tables.note)
      .values({
        id,
        userId: event.context.user!.id,
      })
      .returning();
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
