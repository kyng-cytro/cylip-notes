import { clear, createStore, del, get, set, type UseStore } from "idb-keyval";
import { STORAGE_NAMES } from "./constants";

const VECTOR = "vector:";

export class SyncState {
  private store: UseStore;

  constructor(userId: string) {
    this.store = createStore(STORAGE_NAMES.syncState(userId), "state");
  }

  getCursor() {
    return get<number>("cursor", this.store).then((cursor) => cursor ?? null);
  }

  setCursor(cursor: number) {
    return set("cursor", cursor, this.store);
  }

  getServerVector(noteId: string) {
    return get<Uint8Array>(VECTOR + noteId, this.store);
  }

  setServerVector(noteId: string, vector: Uint8Array) {
    return set(VECTOR + noteId, vector, this.store);
  }

  forget(noteId: string) {
    return del(VECTOR + noteId, this.store);
  }

  clear() {
    return clear(this.store);
  }
}
