import { HEADERS, WORKER_ROUTES } from "@/lib/sync/constants";
import type { NoteRole } from "@/lib/sync/protocol";
import { noteDoc, workspaceDoc } from "./docs";
import type { Env } from "./env";
import { status } from "./http";

type Params = { noteId: string; userId: string };
type Route = {
  method: "POST" | "DELETE";
  pattern: URLPattern;
  handle: (env: Env, params: Params, request: Request) => Promise<unknown>;
};

const route = (
  method: Route["method"],
  pathname: string,
  handle: Route["handle"],
): Route => ({
  method,
  pattern: new URLPattern({ pathname }),
  handle,
});

const routes = [
  route(
    "POST",
    WORKER_ROUTES.workspaceNote,
    async (env, { userId, noteId }, request) => {
      const { role } = await request.json<{ role: NoteRole }>();
      return (await workspaceDoc(env, userId)).addNote(noteId, role);
    },
  ),
  route(
    "POST",
    WORKER_ROUTES.workspaceNoteShared,
    async (env, { userId, noteId }, request) => {
      const { shared } = await request.json<{ shared: boolean }>();
      return (await workspaceDoc(env, userId)).setShared(noteId, shared);
    },
  ),
  route("POST", WORKER_ROUTES.workspaceInvites, async (env, { userId }) =>
    (await workspaceDoc(env, userId)).notifyInvitesChanged(),
  ),
  route(
    "DELETE",
    WORKER_ROUTES.workspaceNote,
    async (env, { userId, noteId }) =>
      (await workspaceDoc(env, userId)).removeNote(noteId),
  ),
  route(
    "DELETE",
    WORKER_ROUTES.noteConnections,
    async (env, { noteId, userId }) =>
      (await noteDoc(env, noteId)).disconnect(userId),
  ),
  route("DELETE", WORKER_ROUTES.note, async (env, { noteId }) =>
    (await noteDoc(env, noteId)).destroy(),
  ),
  route("POST", WORKER_ROUTES.loadNote, (env, { noteId }) =>
    noteDoc(env, noteId),
  ),
  route("POST", WORKER_ROUTES.loadWorkspace, (env, { userId }) =>
    workspaceDoc(env, userId),
  ),
];

export const handleInternal = async (env: Env, request: Request) => {
  if (request.headers.get(HEADERS.syncSecret) !== env.SYNC_SECRET)
    return status(401);
  for (const { method, pattern, handle } of routes) {
    const match = pattern.exec(request.url);
    if (method !== request.method || !match) continue;
    await handle(env, match.pathname.groups as Params, request);
    return status(204);
  }
  return status(404);
};
