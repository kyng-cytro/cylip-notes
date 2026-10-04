import { updateMemberSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const email = getRouterParam(event, "email", { decode: true })!;
  await requireNoteRole(id, event.context.user.id, ["owner"]);
  const { role } = await readValidatedBody(event, updateMemberSchema.parse);
  await updateSharedRole(id, email, role);
  return { ok: true };
});
