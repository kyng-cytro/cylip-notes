import { updateUserSchema } from "@/schemas/user";

export default defineAuthenticatedEventHandler(async (event) => {
  const { name, email, picture } = await readValidatedBody(
    event,
    updateUserSchema.parse,
  );
  try {
    const db = useDrizzle();
    const { id } = event.context.user;

    const data = {
      name,
      email,
      picture,
    };

    await db.update(tables.user).set(data).where(eq(tables.user.id, id));
    const user = await db.query.user.findFirst({
      where: eq(tables.user.id, id),
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: "Failed to update user.",
      });
    }

    return user;
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: `Failed to update user.`,
    });
  }
});
