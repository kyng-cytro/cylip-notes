import { labelCreateSchema } from "@/schemas/label";
import { CONSTANTS, slugify } from "@/utils/helpers";
import { generateId } from "lucia";

export default defineAuthenticatedEventHandler(async (event) => {
  const { name, ...rest } = await readValidatedBody(
    event,
    labelCreateSchema.parse,
  );
  const db = useDrizzle();

  const { id, accountType } = event.context.user;

  if (accountType === "free") {
    const currentCount = await db.query.label.findMany({
      where: eq(tables.label.userId, id),
    });
    if (currentCount.length >= CONSTANTS.maxFreeLables) {
      throw createError({
        statusCode: 403,
        message: "Freeloaders can only have 3 labels.",
      });
    }
  }
  try {
    const slug = slugify(name);
    const labelId = generateId(15);

    const label = await db
      .insert(tables.label)
      .values({
        name,
        slug,
        ...rest,
        userId: id,
        id: labelId,
      })
      .returning();

    if (!label.length || !label[0]) throw createError({ statusCode: 500 });
    return label[0];
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message:
        "Could not create label user may already have a label with that name.",
    });
  }
});
