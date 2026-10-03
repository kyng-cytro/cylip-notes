import { NOTE_CHANGED, SAVE_DEBOUNCE } from "@/lib/sync/constants";
import {
  getNotesMap,
  readWorkspace,
  toYMap,
  writeWorkspace,
  type NoteChangedMessage,
  type NoteRole,
  type WorkspaceNote,
} from "@/lib/sync/protocol";
import { keyBefore } from "@/lib/sync/ordering";
import { YServer } from "y-partyserver";
import * as Y from "yjs";
import { fetchWorkspaceSeed, projectWorkspace } from "./app";
import type { Env } from "./env";
import { loadState, saveState } from "./storage";

export class WorkspaceDoc extends YServer<Env> {
  static callbackOptions = SAVE_DEBOUNCE.workspace;

  async onLoad() {
    const stored = loadState(this.ctx.storage);
    if (stored) {
      Y.applyUpdate(this.document, stored);
      return;
    }
    writeWorkspace(
      this.document,
      await fetchWorkspaceSeed(this.env, this.name),
    );
    saveState(this.ctx.storage, Y.encodeStateAsUpdate(this.document));
  }

  async onSave() {
    saveState(this.ctx.storage, Y.encodeStateAsUpdate(this.document));
    await this.project();
  }

  project() {
    return projectWorkspace(this.env, this.name, readWorkspace(this.document));
  }

  notifyNoteChanged(noteId: string) {
    if (!getNotesMap(this.document).has(noteId)) return;
    const message: NoteChangedMessage = { type: NOTE_CHANGED, id: noteId };
    this.broadcastCustomMessage(JSON.stringify(message));
  }

  addNote(noteId: string, role: NoteRole) {
    const notes = getNotesMap(this.document);
    const existing = notes.get(noteId);
    if (existing) {
      existing.set("role", role);
      return;
    }
    const entry: WorkspaceNote = {
      role,
      pinned: false,
      archived: false,
      labelId: null,
      sortKey: keyBefore(this.firstSortKey()),
      labelSortKey: null,
      reminderAt: null,
      preview: true,
      addedAt: Date.now(),
    };
    notes.set(noteId, toYMap(entry));
  }

  removeNote(noteId: string) {
    getNotesMap(this.document).delete(noteId);
  }

  private firstSortKey() {
    const keys = [...getNotesMap(this.document).values()]
      .map((entry) => entry.get("sortKey") as string)
      .sort();
    return keys[0] ?? null;
  }
}
