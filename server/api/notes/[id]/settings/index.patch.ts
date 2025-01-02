import { noteSettingsPatchSchema } from "@/schemas/note";
import { generateId } from "lucia";

export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }
  const { field, value } = await readValidatedBody(
    event,
    noteSettingsPatchSchema.parse,
  );
  try {
    const db = useDrizzle();
    const note = await db.query.note.findFirst({
      where: and(
        eq(tables.note.id, id),
        eq(tables.note.userId, event.context.user!.id),
      ),
      with: { settings: true },
    });
    if (!note) {
      throw createError({
        statusCode: 404,
        message:
          "Failed to modify note. Note may not exist, or you don't have access to it.",
      });
    }
    const data = {
      ...(field === "background" && value),
      updatedAt: new Date(),
    };
    if (!note.settingsId) {
      const settingsId = generateId(15);
      await db.batch([
        db.insert(tables.noteSettings).values({ id: settingsId, ...data }),
        db
          .update(tables.note)
          .set({ settingsId, updatedAt: new Date() })
          .where(eq(tables.note.id, id)),
      ]);
    } else {
      await db
        .update(tables.noteSettings)
        .set(data)
        .where(eq(tables.noteSettings.id, note.settingsId));
    }
    const updated = await db.query.note.findFirst({
      where: eq(tables.note.id, id),
      with: { label: true, settings: true },
    });
    if (!updated) {
      throw createError({
        statusCode: 404,
        message:
          "Failed to modify note. Note may not exist, or you don't have access to it.",
      });
    }
    return updated;
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to modify note. Note may not exist, or you don't have access to it.`,
    });
  }
});
