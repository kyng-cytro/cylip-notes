import { CLIENT_ROUTES, WORKER_ROUTES } from "@/lib/sync/constants";
import { routePartykitRequest, type Lobby } from "partyserver";
import { authorize } from "./app";
import { pull, push } from "./client-routes";
import { reprojectWorkspace } from "./docs";
import type { Env } from "./env";
import {
  bearerToken,
  corsHeaders,
  errorResponse,
  status,
  withCors,
} from "./http";
import { withIdentity } from "./identity";
import { handleInternal } from "./internal-routes";

export { NoteDoc } from "./note-doc";
export { WorkspaceDoc } from "./workspace-doc";

const clientRoutes: Record<string, typeof pull | typeof push> = {
  [CLIENT_ROUTES.pull]: pull,
  [CLIENT_ROUTES.push]: push,
};

const authorizeConnection = async (
  env: Env,
  ctx: ExecutionContext,
  request: Request,
  lobby: Lobby<Env>,
) => {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return status(401);
  const kind = lobby.className === "NoteDoc" ? "note" : "workspace";
  try {
    const { created, ...identity } = await authorize(env, {
      token,
      kind,
      id: lobby.name,
    });
    if (created) ctx.waitUntil(reprojectWorkspace(env, identity.userId));
    return withIdentity(request, identity);
  } catch (error) {
    return errorResponse(error);
  }
};

const handleClientRequest = async (
  env: Env,
  request: Request,
  handler: typeof pull | typeof push,
) => {
  const token = bearerToken(request);
  if (!token) return status(401);
  try {
    return Response.json(await handler(env, token, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (request.method === "OPTIONS")
      return new Response(null, { headers: corsHeaders(env) });
    if (pathname.startsWith(WORKER_ROUTES.prefix))
      return handleInternal(env, request);
    const clientRoute = clientRoutes[pathname];
    if (clientRoute && request.method === "POST") {
      return withCors(
        env,
        await handleClientRequest(env, request, clientRoute),
      );
    }
    const party = await routePartykitRequest(request, env, {
      onBeforeConnect: (req, lobby) =>
        authorizeConnection(env, ctx, req, lobby),
    });
    return party ?? status(404);
  },
} satisfies ExportedHandler<Env>;
