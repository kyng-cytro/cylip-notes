import type { NoteRole } from "@/lib/sync/protocol";
import { getServerByName } from "partyserver";
import type { Env } from "./env";

type Handler = (
  env: Env,
  params: Record<string, string>,
  request: Request,
) => Promise<void>;

const routes: { method: string; pattern: URLPattern; handler: Handler }[] = [
  {
    method: "POST",
    pattern: new URLPattern({
      pathname: "/internal/workspaces/:userId/notes/:noteId",
    }),
    handler: async (env, { userId, noteId }, request) => {
      const { role } = await request.json<{ role: NoteRole }>();
      await (
        await getServerByName(env.WorkspaceDoc, userId!)
      ).addNote(noteId!, role);
    },
  },
  {
    method: "DELETE",
    pattern: new URLPattern({
      pathname: "/internal/workspaces/:userId/notes/:noteId",
    }),
    handler: async (env, { userId, noteId }) => {
      await (
        await getServerByName(env.WorkspaceDoc, userId!)
      ).removeNote(noteId!);
    },
  },
  {
    method: "DELETE",
    pattern: new URLPattern({
      pathname: "/internal/notes/:noteId/connections/:userId",
    }),
    handler: async (env, { noteId, userId }) => {
      await (await getServerByName(env.NoteDoc, noteId!)).disconnect(userId!);
    },
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/internal/notes/:noteId" }),
    handler: async (env, { noteId }) => {
      await (await getServerByName(env.NoteDoc, noteId!)).destroy();
    },
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/internal/notes/:noteId/load" }),
    handler: async (env, { noteId }) => {
      await getServerByName(env.NoteDoc, noteId!);
    },
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/internal/workspaces/:userId/load" }),
    handler: async (env, { userId }) => {
      await getServerByName(env.WorkspaceDoc, userId!);
    },
  },
];

export const handleInternal = async (env: Env, request: Request) => {
  if (request.headers.get("x-sync-secret") !== env.SYNC_SECRET) {
    return new Response(null, { status: 401 });
  }
  for (const route of routes) {
    const match = route.pattern.exec(request.url);
    if (route.method !== request.method || !match) continue;
    await route.handler(
      env,
      match.pathname.groups as Record<string, string>,
      request,
    );
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 404 });
};
