import type { NoteView } from "./sync/note-views";
import type { WorkspaceLabel, WorkspaceNote } from "./sync/protocol";

export type SerializeDates<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? SerializeDates<U>[]
    : T extends object
      ? { [K in keyof T]: SerializeDates<T[K]> }
      : T;

export type ClientLabel = WorkspaceLabel & { id: string };

export type ClientNote = NoteView &
  WorkspaceNote & { label: ClientLabel | null };

export type NoteScope =
  "active" | "pinned" | "trashed" | "archived" | "reminders";
