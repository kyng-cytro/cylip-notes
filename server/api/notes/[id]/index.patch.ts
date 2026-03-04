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
    const data: Record<string, any> = {
      ...(field === "options" && { options: value }),
      ...(field === "reminder_at" && { reminderAt: value }),
      ...(field === "pinned" && { pinned: value, archived: false }),
      ...(field === "archived" && { archived: value, pinned: false }),
      ...(field === "trashed" && {
        trashed: value,
        pinned: false,
        archived: false,
        trashedAt: value ? new Date() : null,
        options: sql`json_set(options, '$.public.enabled', false)`,
      }),
    };
    if (field === "label") {
      if (!value) {
        data.labelId = null;
        data.labelOrder = null;
      } else {
        const label = await db.query.label.findFirst({
          where: and(
            eq(tables.label.id, value),
            eq(tables.label.userId, event.context.user.id),
          ),
        });
        if (!label) {
          throw createError({
            statusCode: 404,
            message: "Could not find label for this user.",
          });
        }
        const [maxLabelOrder] = await db
          .select({
            value: sql<number>`coalesce(max(${tables.note.labelOrder}), 0)`,
          })
          .from(tables.note)
          .where(
            and(
              eq(tables.note.userId, event.context.user.id),
              eq(tables.note.labelId, value),
            ),
          );
        data.labelId = value;
        data.labelOrder = (maxLabelOrder?.value || 0) + 1;
      }
    }
    await db
      .update(tables.note)
      .set(data)
      .where(
        and(
          eq(tables.note.id, id),
          eq(tables.note.userId, event.context.user.id),
          ...(field !== "trashed" ? [eq(tables.note.trashed, false)] : []),
        ),
      );
    const note = await db.query.note.findFirst({
      where: and(
        eq(tables.note.id, id),
        eq(tables.note.userId, event.context.user.id),
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
