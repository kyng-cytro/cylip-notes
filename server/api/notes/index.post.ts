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
            where: and(
              eq(tables.label.id, labelId),
              eq(tables.label.userId, event.context.user.id),
            ),
          })
        : null;

    const [maxGlobalOrder] = await db
      .select({
        value: sql<number>`coalesce(max(${tables.note.globalOrder}), 0)`,
      })
      .from(tables.note)
      .where(eq(tables.note.userId, event.context.user.id));

    const [maxLabelOrder] =
      label?.id
        ? await db
            .select({
              value: sql<number>`coalesce(max(${tables.note.labelOrder}), 0)`,
            })
            .from(tables.note)
            .where(
              and(
                eq(tables.note.userId, event.context.user.id),
                eq(tables.note.labelId, label.id),
              ),
            )
        : [{ value: 0 }];

    await db.insert(tables.note).values({
      id,
      userId: event.context.user.id,
      labelId: label?.id || null,
      globalOrder: (maxGlobalOrder?.value || 0) + 1,
      labelOrder: label?.id ? (maxLabelOrder?.value || 0) + 1 : null,
      options: label?.options
        ? { ...label.options, public: { enabled: false, vists: 0 } }
        : undefined,
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
