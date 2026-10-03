import {
  clear,
  createStore,
  del,
  get,
  keys,
  set,
  type UseStore,
} from "idb-keyval";

const DIRTY = "dirty:";
const VECTOR = "vector:";

export class SyncState {
  private store: UseStore;

  constructor(userId: string) {
    this.store = createStore(`cylip-sync-${userId}`, "state");
  }

  getCursor() {
    return get<number>("cursor", this.store).then((cursor) => cursor ?? null);
  }

  setCursor(cursor: number) {
    return set("cursor", cursor, this.store);
  }

  markDirty(noteId: string) {
    return set(DIRTY + noteId, true, this.store);
  }

  async getDirty() {
    const all = await keys<string>(this.store);
    return all
      .filter((key) => key.startsWith(DIRTY))
      .map((key) => key.slice(DIRTY.length));
  }

  clearDirty(noteId: string) {
    return del(DIRTY + noteId, this.store);
  }

  getServerVector(noteId: string) {
    return get<string>(VECTOR + noteId, this.store);
  }

  setServerVector(noteId: string, vector: string) {
    return set(VECTOR + noteId, vector, this.store);
  }

  async forget(noteId: string) {
    await Promise.all([
      this.clearDirty(noteId),
      del(VECTOR + noteId, this.store),
    ]);
  }

  clear() {
    return clear(this.store);
  }
}
