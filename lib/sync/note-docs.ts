import { CHANNELS, STORAGE_NAMES } from "@/constants";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

type Listeners = {
  onLocalChange: (noteId: string) => void;
  onChange: (noteId: string) => void;
};

type Entry = { doc: Y.Doc; persistence: IndexeddbPersistence | null };

type TabMessage = { noteId: string; update: Uint8Array };

const FROM_OTHER_TAB = Symbol("other-tab");

export class NoteDocs {
  private entries = new Map<string, Entry>();
  private channel: BroadcastChannel;

  constructor(
    private userId: string,
    private listeners: Listeners,
  ) {
    this.channel = new BroadcastChannel(CHANNELS.notes(userId));
    this.channel.onmessage = ({ data }: MessageEvent<TabMessage>) => {
      const entry = this.entries.get(data.noteId);
      if (entry) Y.applyUpdate(entry.doc, data.update, FROM_OTHER_TAB);
    };
  }

  ids() {
    return [...this.entries.keys()];
  }

  has(noteId: string) {
    return this.entries.has(noteId);
  }

  get(noteId: string, persist: boolean) {
    return this.open(noteId, persist).doc;
  }

  async load(noteId: string, persist: boolean) {
    const { doc, persistence } = this.open(noteId, persist);
    await persistence?.whenSynced;
    return doc;
  }

  async remove(noteId: string) {
    const entry = this.entries.get(noteId);
    if (!entry) return;
    this.entries.delete(noteId);
    await entry.persistence?.clearData();
    entry.doc.destroy();
  }

  async removeAll() {
    await Promise.all(this.ids().map((id) => this.remove(id)));
  }

  close() {
    this.channel.close();
  }

  async setPersisted(noteId: string, persist: boolean) {
    const entry = this.entries.get(noteId);
    if (!entry || !!entry.persistence === persist) return;
    if (persist) {
      entry.persistence = this.persist(noteId, entry.doc);
      return;
    }
    const persistence = entry.persistence!;
    entry.persistence = null;
    await persistence.clearData();
  }

  private persist(noteId: string, doc: Y.Doc) {
    return new IndexeddbPersistence(
      STORAGE_NAMES.note(this.userId, noteId),
      doc,
    );
  }

  private open(noteId: string, persist: boolean) {
    const existing = this.entries.get(noteId);
    if (existing) return existing;
    const doc = new Y.Doc();
    const entry: Entry = {
      doc,
      persistence: persist ? this.persist(noteId, doc) : null,
    };
    doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin !== FROM_OTHER_TAB && origin !== entry.persistence) {
        this.channel.postMessage({ noteId, update } satisfies TabMessage);
      }
    });
    doc.on("afterTransaction", (transaction) => {
      if (transaction.changed.size === 0) return;
      if (transaction.local) this.listeners.onLocalChange(noteId);
      this.listeners.onChange(noteId);
    });
    this.entries.set(noteId, entry);
    return entry;
  }
}
