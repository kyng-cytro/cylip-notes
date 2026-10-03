import { APP_ROUTES, HEADERS, toPath } from "@/lib/sync/constants";
import type { NoteRole, WorkspaceSnapshot } from "@/lib/sync/protocol";
import type { Env, Identity } from "./env";

export class AppError extends Error {
  constructor(public status: number) {
    super(`App responded with ${status}`);
  }
}

const callApp = async <T>(
  env: Env,
  path: string,
  body?: unknown,
): Promise<T> => {
  const response = await fetch(new URL(path, env.APP_URL), {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      [HEADERS.syncSecret]: env.SYNC_SECRET,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new AppError(response.status);
  return response.json() as Promise<T>;
};

const orNullWhenMissing = <T>(promise: Promise<T>) =>
  promise.catch((error) => {
    if (error instanceof AppError && error.status === 404) return null;
    throw error;
  });

export type BatchAccess = {
  userId: string;
  roles: Record<string, NoteRole>;
  changed: string[];
  denied: string[];
  created: string[];
  cursor: number;
};

export const authorize = (
  env: Env,
  body: { token: string; kind: "note" | "workspace"; id: string },
) => callApp<Identity & { created: boolean }>(env, APP_ROUTES.authorize, body);

export const authorizeBatch = (
  env: Env,
  body: {
    token: string;
    ids: string[];
    create: boolean;
    since?: number | null;
  },
) => callApp<BatchAccess>(env, APP_ROUTES.authorizeBatch, body);

export const fetchNoteSeed = async (env: Env, noteId: string) => {
  const seed = await orNullWhenMissing(
    callApp<{ state: string }>(env, toPath(APP_ROUTES.noteSeed, { noteId })),
  );
  return seed?.state ?? null;
};

export const projectNote = (env: Env, noteId: string, state: string) =>
  callApp<{ audience: string[] }>(
    env,
    toPath(APP_ROUTES.noteProject, { noteId }),
    { state },
  );

export const fetchWorkspaceSeed = (env: Env, userId: string) =>
  callApp<WorkspaceSnapshot>(env, toPath(APP_ROUTES.workspaceSeed, { userId }));

export const projectWorkspace = (
  env: Env,
  userId: string,
  snapshot: WorkspaceSnapshot,
) =>
  callApp(env, toPath(APP_ROUTES.workspaceProject, { userId }), { snapshot });
