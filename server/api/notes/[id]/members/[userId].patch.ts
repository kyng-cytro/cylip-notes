import { updateMemberSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const userId = getRouterParam(event, "userId")!;
  await requireNoteRole(id, event.context.user.id, ["owner"]);
  const { role } = await readValidatedBody(event, updateMemberSchema.parse);
  await requireNoteRole(id, userId, ["editor", "viewer"]);
  await grantNoteAccess(id, userId, role);
  return { ok: true };
});
