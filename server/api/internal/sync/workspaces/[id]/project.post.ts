import { z } from "zod";

const bodySchema = z.object({ snapshot: workspaceSnapshotSchema });

export default defineSyncEventHandler(async (event) => {
  const { snapshot } = await readValidatedBody(event, bodySchema.parse);
  await projectWorkspace(getRouterParam(event, "id")!, snapshot);
  return { ok: true };
});
