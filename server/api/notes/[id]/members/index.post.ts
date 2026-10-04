import { addMemberSchema } from "@/schemas/note";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const { user } = event.context;
  await requireNoteRole(id, user.id, ["owner"]);
  const person = await readValidatedBody(event, addMemberSchema.parse);
  await shareNote(id, user, person);
  return { ok: true };
});
