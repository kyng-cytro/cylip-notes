import { getServerByName, routePartykitRequest, type Lobby } from "partyserver";
import { AppError, authorize } from "./app";
import { pull, push } from "./client-routes";
import type { Env } from "./env";
import { bearerToken, corsHeaders, json, status } from "./http";
import { withIdentity } from "./identity";
import { handleInternal } from "./internal-routes";

export { NoteDoc } from "./note-doc";
export { WorkspaceDoc } from "./workspace-doc";

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
    if (created) {
      ctx.waitUntil(
        getServerByName(env.WorkspaceDoc, identity.userId).then((w) =>
          w.project(),
        ),
      );
    }
    return withIdentity(request, identity);
  } catch (error) {
    return status(error instanceof AppError ? error.status : 500);
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
    return json(await handler(env, token, await request.json()));
  } catch (error) {
    return status(error instanceof AppError ? error.status : 500);
  }
};

const withCors = (env: Env, response: Response) => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env)))
    headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }
    if (pathname.startsWith("/internal/")) return handleInternal(env, request);
    if (request.method === "POST" && pathname === "/sync/pull") {
      return withCors(env, await handleClientRequest(env, request, pull));
    }
    if (request.method === "POST" && pathname === "/sync/push") {
      return withCors(env, await handleClientRequest(env, request, push));
    }
    const party = await routePartykitRequest(request, env, {
      onBeforeConnect: (req, lobby) =>
        authorizeConnection(env, ctx, req, lobby),
    });
    return party ?? status(404);
  },
} satisfies ExportedHandler<Env>;
