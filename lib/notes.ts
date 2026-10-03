import type { ClientNote, NoteScope } from "./types";

export type ToggleProp =
  "pinned" | "archived" | "trashed" | "preview" | "public";

export const scopeFilters: Record<NoteScope, (note: ClientNote) => boolean> = {
  active: (note) => !note.trashed && !note.archived && !note.pinned,
  pinned: (note) => !note.trashed && !note.archived && note.pinned,
  trashed: (note) => note.trashed,
  archived: (note) => note.archived && !note.trashed,
  reminders: (note) => !!note.reminderAt && !note.trashed,
};

export const toggleMessages: Record<ToggleProp, (note: ClientNote) => string> =
  {
    pinned: (note) => (note.pinned ? "unpinned" : "pinned"),
    archived: (note) => (note.archived ? "unarchived" : "archived"),
    trashed: (note) => (note.trashed ? "restored" : "trashed"),
    preview: (note) => (note.preview ? "preview disabled" : "preview enabled"),
    public: (note) => (note.public ? "is now private" : "is now public"),
  };

export const sortKeyIn = (
  note: ClientNote | undefined,
  labelId: string | null,
) => (labelId ? note?.labelSortKey : note?.sortKey);
