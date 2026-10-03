import { HEADERS, toPath, WORKER_ROUTES } from "@/lib/sync/constants";
import type { NoteRole } from "@/lib/sync/protocol";

const callWorker = (
  method: "POST" | "DELETE",
  pattern: string,
  params: Record<string, string>,
  body?: object,
) => {
  const { url, secret } = useRuntimeConfig().sync;
  return $fetch(toPath(pattern, params), {
    baseURL: url,
    method,
    body,
    headers: { [HEADERS.syncSecret]: secret },
  });
};

export const addToWorkspace = (
  userId: string,
  noteId: string,
  role: NoteRole,
) =>
  callWorker("POST", WORKER_ROUTES.workspaceNote, { userId, noteId }, { role });

export const removeFromWorkspace = (userId: string, noteId: string) =>
  callWorker("DELETE", WORKER_ROUTES.workspaceNote, { userId, noteId });

export const disconnectFromNote = (noteId: string, userId: string) =>
  callWorker("DELETE", WORKER_ROUTES.noteConnections, { noteId, userId });

export const destroyNoteDoc = (noteId: string) =>
  callWorker("DELETE", WORKER_ROUTES.note, { noteId });

export const loadNoteDoc = (noteId: string) =>
  callWorker("POST", WORKER_ROUTES.loadNote, { noteId });

export const loadWorkspaceDoc = (userId: string) =>
  callWorker("POST", WORKER_ROUTES.loadWorkspace, { userId });
