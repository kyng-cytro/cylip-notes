export const SYNC_TIMING = {
  syncDelay: 1000,
  syncInterval: 60_000,
  viewRefreshDelay: 150,
  updatedAtThrottle: 30_000,
  requestTimeout: 20_000,
  tokenTimeout: 10_000,
  imageUploadTimeout: 30_000,
} as const;

export const SAVE_DEBOUNCE = {
  note: { debounceWait: 2000, debounceMaxWait: 10_000 },
  workspace: { debounceWait: 1000, debounceMaxWait: 5000 },
} as const;

export const PARTIES = {
  note: "note-doc",
  workspace: "workspace-doc",
} as const;

export const DOC_KEYS = {
  content: "default",
  meta: "meta",
  notes: "notes",
  labels: "labels",
} as const;

export const NOTE_CHANGED = "note-changed";

export const INVITES_CHANGED = "invites-changed";

export const CLOSE_CODES = { accessChanged: 4003, noteDeleted: 4004 } as const;

export const HEADERS = {
  syncSecret: "x-sync-secret",
  identity: "x-sync-identity",
} as const;

export const CHANNELS = {
  notes: (userId: string) => `cylip-notes-${userId}`,
};

export const STORAGE_NAMES = {
  note: (userId: string, noteId: string) => `cylip-note-${userId}-${noteId}`,
  workspace: (userId: string) => `cylip-workspace-${userId}`,
  syncState: (userId: string) => `cylip-sync-${userId}`,
};

export const CLIENT_ROUTES = {
  pull: "/sync/pull",
  push: "/sync/push",
} as const;

export const WORKER_ROUTES = {
  prefix: "/internal/",
  workspaceNote: "/internal/workspaces/:userId/notes/:noteId",
  workspaceNoteShared: "/internal/workspaces/:userId/notes/:noteId/shared",
  workspaceInvites: "/internal/workspaces/:userId/invites",
  noteConnections: "/internal/notes/:noteId/connections/:userId",
  note: "/internal/notes/:noteId",
  loadNote: "/internal/notes/:noteId/load",
  loadWorkspace: "/internal/workspaces/:userId/load",
} as const;

export const APP_ROUTES = {
  prefix: "/api/internal/",
  authorize: "/api/internal/sync/authorize",
  authorizeBatch: "/api/internal/sync/authorize-batch",
  noteSeed: "/api/internal/sync/notes/:noteId/seed",
  noteProject: "/api/internal/sync/notes/:noteId/project",
  workspaceSeed: "/api/internal/sync/workspaces/:userId/seed",
  workspaceProject: "/api/internal/sync/workspaces/:userId/project",
} as const;

export const toPath = (pattern: string, params: Record<string, string>) =>
  pattern.replace(/:(\w+)/g, (_, key: string) =>
    encodeURIComponent(params[key]!),
  );
