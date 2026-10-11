import { z } from "zod";

const bodySchema = z.object({
  title: z.string().nullable(),
  content: z.looseObject({ type: z.literal("doc") }),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const versionId = getRouterParam(event, "versionId")!;
  const { user } = event.context;
  await requireNoteHistory(event, id, user.id);
  const current = await readValidatedBody(event, bodySchema.parse);
  const { version } = await findNoteVersion(id, versionId, user.accountType);
  await recordNoteVersion(id, current, [], { seal: true });
  return { title: version.title, content: version.content };
});
