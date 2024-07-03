import { generateId } from "lucia";
import { slugify } from "@/utils/helpers";
import { groupCreateSchema } from "@/schemas/groups";

export default defineAuthenticatedEventHandler(async (event) => {
  const { name } = await readValidatedBody(event, groupCreateSchema.parse);
  const db = useDrizzle();

  const { id, accountType } = event.context.user!;

  if (accountType === "free") {
    const currentCount = await db.query.noteGroupTable.findMany({
      where: eq(tables.noteGroupTable.userId, id),
    });
    if (currentCount.length >= 3) {
      throw createError({
        statusCode: 403,
        message: "Freeloaders can only have 3 note groups.",
      });
    }
  }
  try {
    const slug = slugify(name);
    await db.insert(tables.noteGroupTable).values({
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
        "Could not create group user may already have a group with that name.",
    });
  }
});
