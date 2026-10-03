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
      "x-sync-secret": env.SYNC_SECRET,
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
) =>
  callApp<Identity & { created: boolean }>(
    env,
    "/api/internal/sync/authorize",
    body,
  );

export const authorizeBatch = (
  env: Env,
  body: {
    token: string;
    ids: string[];
    create: boolean;
    since?: number | null;
  },
) => callApp<BatchAccess>(env, "/api/internal/sync/authorize-batch", body);

export const fetchNoteSeed = async (env: Env, noteId: string) => {
  const seed = await orNullWhenMissing(
    callApp<{ state: string }>(env, `/api/internal/sync/notes/${noteId}/seed`),
  );
  return seed?.state ?? null;
};

export const projectNote = (env: Env, noteId: string, state: string) =>
  callApp<{ audience: string[] }>(
    env,
    `/api/internal/sync/notes/${noteId}/project`,
    {
      state,
    },
  );

export const fetchWorkspaceSeed = (env: Env, userId: string) =>
  callApp<WorkspaceSnapshot>(
    env,
    `/api/internal/sync/workspaces/${userId}/seed`,
  );

export const projectWorkspace = (
  env: Env,
  userId: string,
  snapshot: WorkspaceSnapshot,
) =>
  callApp(env, `/api/internal/sync/workspaces/${userId}/project`, { snapshot });
