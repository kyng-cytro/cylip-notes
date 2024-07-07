import { generateId } from "lucia";
import { slugify } from "@/utils/helpers";
import { labelCreateSchema } from "@/schemas/labels";

export default defineAuthenticatedEventHandler(async (event) => {
  const { name } = await readValidatedBody(event, labelCreateSchema.parse);
  const db = useDrizzle();

  const { id, accountType } = event.context.user!;

  if (accountType === "free") {
    const currentCount = await db.query.label.findMany({
      where: eq(tables.label.userId, id),
    });
    if (currentCount.length >= 3) {
      throw createError({
        statusCode: 403,
        message: "Freeloaders can only have 3  labels.",
      });
    }
  }
  try {
    const slug = slugify(name);
    await db.insert(tables.label).values({
      id: generateId(15),
      name,
      slug,
      userId: id,
    });
    return event.node.res.writeHead(200).end();
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message:
        "Could not create label user may already have a label with that name.",
    });
  }
});
