import { updatePreferencesSchema } from "@/schemas/preferences";

export default defineAuthenticatedEventHandler(async (event) => {
  const values = await readValidatedBody(event, updatePreferencesSchema.parse);
  const [user] = await useDrizzle()
    .update(tables.user)
    .set({
      preferences: sql`json_patch(${tables.user.preferences}, ${JSON.stringify(values)})`,
    })
    .where(eq(tables.user.id, event.context.user.id))
    .returning({ preferences: tables.user.preferences });
  if (!user) throw createError({ statusCode: 404 });
  return user.preferences;
});
