import { NOTE_CHANGED, PARTIES, STORAGE_NAMES } from "./constants";
import { IndexeddbPersistence } from "y-indexeddb";
import YProvider from "y-partyserver/provider";
import * as Y from "yjs";
import {
  getLabelsMap,
  getNotesMap,
  readWorkspace,
  toYMap,
  writeMap,
  type NoteChangedMessage,
  type WorkspaceLabel,
  type WorkspaceNote,
} from "./protocol";

type Options = {
  userId: string;
  syncUrl: string;
  getToken: () => Promise<string>;
  onChange: () => void;
  onConnect: () => void;
  onNoteChanged: (noteId: string) => void;
};

export class Workspace {
  readonly doc = new Y.Doc();
  private persistence: IndexeddbPersistence;
  private provider: YProvider | null = null;

  constructor(private options: Options) {
    this.persistence = new IndexeddbPersistence(
      STORAGE_NAMES.workspace(options.userId),
      this.doc,
    );
    getNotesMap(this.doc).observeDeep(options.onChange);
    getLabelsMap(this.doc).observeDeep(options.onChange);
  }

  load() {
    return this.persistence.whenSynced;
  }

  connect() {
    this.provider = new YProvider(
      this.options.syncUrl,
      this.options.userId,
      this.doc,
      {
        party: PARTIES.workspace,
        params: async () => ({ token: await this.options.getToken() }),
      },
    );
    this.provider.on("status", ({ status }: { status: string }) => {
      if (status === "connected") this.options.onConnect();
    });
    this.provider.on("custom-message", (message: string) => {
      const parsed = JSON.parse(message) as NoteChangedMessage;
      if (parsed.type === NOTE_CHANGED) this.options.onNoteChanged(parsed.id);
    });
  }

  snapshot() {
    return readWorkspace(this.doc);
  }

  addNote(noteId: string, entry: WorkspaceNote) {
    getNotesMap(this.doc).set(noteId, toYMap(entry));
  }

  updateNote(noteId: string, values: Partial<WorkspaceNote>) {
    const entry = getNotesMap(this.doc).get(noteId);
    if (entry) writeMap(entry, values);
  }

  removeNote(noteId: string) {
    getNotesMap(this.doc).delete(noteId);
  }

  addLabel(labelId: string, label: WorkspaceLabel) {
    getLabelsMap(this.doc).set(labelId, toYMap(label));
  }

  updateLabel(labelId: string, values: Partial<WorkspaceLabel>) {
    const label = getLabelsMap(this.doc).get(labelId);
    if (label) writeMap(label, values);
  }

  removeLabel(labelId: string) {
    this.doc.transact(() => {
      getLabelsMap(this.doc).delete(labelId);
      for (const entry of getNotesMap(this.doc).values()) {
        if (entry.get("labelId") === labelId) {
          writeMap(entry, { labelId: null, labelSortKey: null });
        }
      }
    });
  }

  async destroy({ clearData }: { clearData: boolean }) {
    this.provider?.destroy();
    if (clearData) await this.persistence.clearData();
    else await this.persistence.destroy();
    this.doc.destroy();
  }
}
