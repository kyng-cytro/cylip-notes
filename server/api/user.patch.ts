import { updateUserSchema } from "@/schemas/user";
export default defineAuthenticatedEventHandler(async (event) => {
  const form = await readFormData(event);
  const name = form.get("name");
  const email = form.get("email");
  const picture = form.get("picture");

  const res = updateUserSchema.safeParse({ name, picture, email });
  if (!res.success) {
    throw createError({
      statusCode: 400,
      message: res.error.message,
    });
  }

  const data = res.data;
  if (data.picture && data.picture instanceof File && data.picture.size) {
    try {
      ensureBlob(data.picture, {
        maxSize: "1MB",
        types: ["image"],
      });
      await hubBlob().put(event.context.user.id, data.picture, {
        addRandomSuffix: false,
        prefix: "profile-pictures",
      });
    } catch (e) {
      throw createError({
        statusCode: 500,
        message: `Failed to upload profile picture.`,
      });
    }
  }

  try {
    const db = useDrizzle();
    const { id } = event.context.user;
    await db
      .update(tables.user)
      .set({
        ...data,
        email: undefined,
        picture: data.picture instanceof File ? getImagePath(id) : data.picture,
      })
      .where(eq(tables.user.id, id));
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
