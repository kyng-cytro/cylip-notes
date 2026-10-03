import { addMemberSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  await requireNoteRole(id, event.context.user.id, ["owner"]);
  const { email, role } = await readValidatedBody(event, addMemberSchema.parse);
  const invitee = await useDrizzle().query.user.findFirst({
    columns: { id: true },
    where: eq(tables.user.email, email),
  });
  if (!invitee) {
    throw createError({
      statusCode: 404,
      message: "No cylip|notes account uses that email.",
    });
  }
  if (invitee.id === event.context.user.id) {
    throw createError({
      statusCode: 400,
      message: "You already own this note.",
    });
  }
  await grantNoteAccess(id, invitee.id, role);
  return { ok: true };
});
