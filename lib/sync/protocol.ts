import * as Y from "yjs";
import { DOC_KEYS, NOTE_CHANGED } from "./constants";

export const NOTE_ROLES = ["owner", "editor", "viewer"] as const;

export type NoteRole = (typeof NOTE_ROLES)[number];

export const canEdit = (role: NoteRole | undefined) =>
  role === "owner" || role === "editor";

export type Background = {
  type: "color" | "image" | null;
  value: string | null;
} | null;

export type NoteMeta = {
  title: string;
  background: Background;
  public: boolean;
  trashed: boolean;
  trashedAt: number | null;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
};

export type WorkspaceNote = {
  role: NoteRole;
  pinned: boolean;
  archived: boolean;
  labelId: string | null;
  sortKey: string;
  labelSortKey: string | null;
  reminderAt: number | null;
  preview: boolean;
  addedAt: number;
  shared?: boolean;
};

export type LabelOptions = {
  preview: boolean;
  background?: Background;
};

export type WorkspaceLabel = {
  name: string;
  slug: string;
  sortKey: string;
  options: LabelOptions;
  createdAt: number;
};

export type WorkspaceSnapshot = {
  notes: Record<string, WorkspaceNote>;
  labels: Record<string, WorkspaceLabel>;
};

export type NoteChangedMessage = { type: typeof NOTE_CHANGED; id: string };

export type PullRequest = {
  docs: Record<string, string>;
  since: number | null;
};

export type PullResponse = {
  cursor: number;
  docs: Record<string, { update: string; sv: string }>;
  denied: string[];
};

export type PushRequest = { docs: Record<string, string> };

export type PushResponse = {
  ok: string[];
  readonly: string[];
  denied: string[];
};

export const getMeta = (doc: Y.Doc) => doc.getMap<unknown>(DOC_KEYS.meta);

export const getNotesMap = (doc: Y.Doc) =>
  doc.getMap<Y.Map<unknown>>(DOC_KEYS.notes);

export const getLabelsMap = (doc: Y.Doc) =>
  doc.getMap<Y.Map<unknown>>(DOC_KEYS.labels);

export const readMeta = (doc: Y.Doc): NoteMeta => {
  const meta = getMeta(doc);
  return {
    title: (meta.get("title") as string) ?? "",
    background: (meta.get("background") as Background) ?? null,
    public: (meta.get("public") as boolean) ?? false,
    trashed: (meta.get("trashed") as boolean) ?? false,
    trashedAt: (meta.get("trashedAt") as number | null) ?? null,
    createdAt: (meta.get("createdAt") as number) ?? 0,
    updatedAt: (meta.get("updatedAt") as number) ?? 0,
    ownerId: (meta.get("ownerId") as string) ?? "",
  };
};

export const readWorkspace = (doc: Y.Doc): WorkspaceSnapshot => ({
  notes: getNotesMap(doc).toJSON(),
  labels: getLabelsMap(doc).toJSON(),
});

export const writeMap = (
  map: Y.Map<unknown>,
  values: Record<string, unknown>,
) => {
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && map.get(key) !== value) map.set(key, value);
  }
};

export const toYMap = (values: Record<string, unknown>) =>
  new Y.Map<unknown>(
    Object.entries(values).filter(([, value]) => value !== undefined),
  );

export const writeWorkspace = (doc: Y.Doc, snapshot: WorkspaceSnapshot) => {
  doc.transact(() => {
    const notes = getNotesMap(doc);
    for (const [id, entry] of Object.entries(snapshot.notes)) {
      notes.set(id, toYMap(entry));
    }
    const labels = getLabelsMap(doc);
    for (const [id, label] of Object.entries(snapshot.labels)) {
      labels.set(id, toYMap(label));
    }
  });
};

export const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

export const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
