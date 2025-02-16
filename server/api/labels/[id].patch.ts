import { labelCreateSchema } from "@/schemas/label";
import { slugify } from "@/utils/helpers";

export default defineAuthenticatedEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  if (!id) {
    throw createError({ statusCode: 400, message: "Invalid or missing id." });
  }

  const { name, ...rest } = await readValidatedBody(
    event,
    labelCreateSchema.partial().parse,
  );

  try {
    const db = useDrizzle();

    const data = {
      ...(name && { name, slug: slugify(name) }),
      ...rest,
      updatedAt: new Date(),
    };

    const label = await db
      .update(tables.label)
      .set(data)
      .where(
        and(
          eq(tables.label.id, id),
          eq(tables.label.userId, event.context.user!.id),
        ),
      );

    if (!label) {
      throw createError({
        statusCode: 404,
        message:
          "Failed to update label. Label may not exist, or you don't have access to it.",
      });
    }
    return label;
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message:
        "Could not update label user may already have a label with that name",
    });
  }
});
