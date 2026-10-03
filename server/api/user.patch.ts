import type { H3Event } from "h3";
import { updateProfileSchema } from "@/schemas/user";

const readProfileForm = async (event: H3Event) => {
  const form = await readFormData(event);
  const result = updateProfileSchema.safeParse({
    name: form.get("name"),
    picture: form.get("picture") || undefined,
  });
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message,
    });
  }
  return result.data;
};

export default defineAuthenticatedEventHandler(async (event) => {
  const { name, picture } = await readProfileForm(event);
  const { id } = event.context.user;
  const image =
    picture instanceof File ? await putProfilePicture(id, picture) : picture;
  const [user] = await useDrizzle()
    .update(tables.user)
    .set({ name, image })
    .where(eq(tables.user.id, id))
    .returning();
  return user;
});
