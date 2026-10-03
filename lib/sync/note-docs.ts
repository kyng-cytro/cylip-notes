import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

type Listeners = {
  onLocalChange: (noteId: string) => void;
  onChange: (noteId: string) => void;
};

type Entry = { doc: Y.Doc; persistence: IndexeddbPersistence };

export class NoteDocs {
  private entries = new Map<string, Entry>();

  constructor(
    private userId: string,
    private listeners: Listeners,
  ) {}

  ids() {
    return [...this.entries.keys()];
  }

  has(noteId: string) {
    return this.entries.has(noteId);
  }

  get(noteId: string) {
    return this.open(noteId).doc;
  }

  async load(noteId: string) {
    await this.open(noteId).persistence.whenSynced;
    return this.get(noteId);
  }

  async remove(noteId: string) {
    const entry = this.entries.get(noteId);
    if (!entry) return;
    this.entries.delete(noteId);
    await entry.persistence.clearData();
    entry.doc.destroy();
  }

  async removeAll() {
    await Promise.all(this.ids().map((id) => this.remove(id)));
  }

  private open(noteId: string) {
    const existing = this.entries.get(noteId);
    if (existing) return existing;
    const doc = new Y.Doc();
    const persistence = new IndexeddbPersistence(
      `cylip-note-${this.userId}-${noteId}`,
      doc,
    );
    doc.on("afterTransaction", (transaction) => {
      if (transaction.changed.size === 0) return;
      if (transaction.local) this.listeners.onLocalChange(noteId);
      this.listeners.onChange(noteId);
    });
    const entry = { doc, persistence };
    this.entries.set(noteId, entry);
    return entry;
  }
}
