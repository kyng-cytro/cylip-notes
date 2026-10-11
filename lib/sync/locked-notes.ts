import { NOTE_LOCK, STORAGE_NAMES, SYNC_TIMING } from "@/constants";
import {
  clear,
  createStore,
  delMany,
  entries,
  get,
  set,
  type UseStore,
} from "idb-keyval";
import { shallowRef } from "vue";
import * as Y from "yjs";
import {
  decrypt,
  deriveKey,
  encrypt,
  exportKey,
  importKey,
  randomBytes,
  type Sealed,
} from "./crypto";
import { fromBase64, toBase64 } from "./protocol";

export type ServerUnlock = {
  token: string;
  lockedAt: number;
  expiresAt: number;
};

type NoteUnlock = {
  lockedAt: number;
  salt: string;
  key: string;
  token: string | null;
  expiresAt: number | null;
};

type NoteUnlocks = Record<string, NoteUnlock>;

type LockedCopy = Sealed & { lockedAt: number; salt: Uint8Array<ArrayBuffer> };

type LockedAtOf = (noteId: string) => number | null | undefined;

const readUnlocks = (storageKey: string): NoteUnlocks => {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) ?? "{}");
  } catch {
    return {};
  }
};

const writeUnlocks = (storageKey: string, unlocks: NoteUnlocks) => {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(unlocks));
  } catch {
    return;
  }
};

export class LockedNotes {
  readonly unlocks;
  private copies: UseStore;
  private keys = new Map<string, Promise<CryptoKey>>();
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private userId: string) {
    this.unlocks = shallowRef(readUnlocks(STORAGE_NAMES.unlocks(userId)));
    this.copies = createStore(STORAGE_NAMES.lockedCopies(userId), "copies");
  }

  hasKey(noteId: string, lockedAt: number | null | undefined) {
    return !!lockedAt && this.unlocks.value[noteId]?.lockedAt === lockedAt;
  }

  token(noteId: string, lockedAt: number | null | undefined) {
    if (!this.hasKey(noteId, lockedAt)) return null;
    const { token, expiresAt } = this.unlocks.value[noteId]!;
    return token && expiresAt && expiresAt > Date.now() ? token : null;
  }

  async unlockOnline(noteId: string, password: string, server: ServerUnlock) {
    const copy = await this.readCopy(noteId);
    const salt =
      copy?.lockedAt === server.lockedAt
        ? copy.salt
        : randomBytes(NOTE_LOCK.saltLength);
    const key = await deriveKey(password, salt);
    this.keep(noteId, {
      lockedAt: server.lockedAt,
      salt: toBase64(salt),
      key: await exportKey(key),
      token: server.token,
      expiresAt: server.expiresAt,
    });
  }

  async unlockOffline(noteId: string, password: string, lockedAt: number) {
    const copy = await this.readCopy(noteId);
    if (copy?.lockedAt !== lockedAt) {
      throw new Error("This note isn't available offline on this device.");
    }
    const key = await deriveKey(password, copy.salt);
    await decrypt(key, copy).catch(() => {
      throw new Error("Incorrect password.");
    });
    this.keep(noteId, {
      lockedAt,
      salt: toBase64(copy.salt),
      key: await exportKey(key),
      token: null,
      expiresAt: null,
    });
  }

  async restore(noteId: string, doc: Y.Doc) {
    const copy = await this.readCopy(noteId);
    if (!copy || !this.hasKey(noteId, copy.lockedAt)) return;
    Y.applyUpdate(doc, await decrypt(await this.key(noteId), copy));
  }

  scheduleSave(noteId: string, doc: Y.Doc) {
    this.cancelSave(noteId);
    this.saveTimers.set(
      noteId,
      setTimeout(() => this.save(noteId, doc), SYNC_TIMING.lockedCopySaveDelay),
    );
  }

  cancelSave(noteId: string) {
    clearTimeout(this.saveTimers.get(noteId));
    this.saveTimers.delete(noteId);
  }

  dropExpiredTokens() {
    const now = Date.now();
    const expired = Object.entries(this.unlocks.value).filter(
      ([, unlock]) => unlock.expiresAt !== null && unlock.expiresAt <= now,
    );
    if (!expired.length) return;
    this.setUnlocks({
      ...this.unlocks.value,
      ...Object.fromEntries(
        expired.map(([id, unlock]) => [
          id,
          { ...unlock, token: null, expiresAt: null },
        ]),
      ),
    });
  }

  async pruneCopies(lockedAtOf: LockedAtOf) {
    const copies = await entries<string, LockedCopy>(this.copies);
    const stale = copies
      .filter(([noteId, copy]) => lockedAtOf(noteId) !== copy.lockedAt)
      .map(([noteId]) => noteId);
    await delMany(stale, this.copies);
  }

  async clear() {
    for (const noteId of this.saveTimers.keys()) this.cancelSave(noteId);
    this.setUnlocks({});
    this.keys.clear();
    await clear(this.copies);
  }

  private async save(noteId: string, doc: Y.Doc) {
    this.saveTimers.delete(noteId);
    const unlock = this.unlocks.value[noteId];
    if (!unlock) return;
    const key = await this.key(noteId);
    const previous = await this.readCopy(noteId);
    const updates = [Y.encodeStateAsUpdate(doc)];
    if (previous?.lockedAt === unlock.lockedAt) {
      updates.push(await decrypt(key, previous));
    }
    const sealed = await encrypt(key, Y.mergeUpdates(updates));
    const copy: LockedCopy = {
      ...sealed,
      lockedAt: unlock.lockedAt,
      salt: fromBase64(unlock.salt),
    };
    await set(noteId, copy, this.copies);
  }

  private readCopy(noteId: string) {
    return get<LockedCopy>(noteId, this.copies);
  }

  private key(noteId: string) {
    const raw = this.unlocks.value[noteId]!.key;
    if (!this.keys.has(raw)) this.keys.set(raw, importKey(raw));
    return this.keys.get(raw)!;
  }

  private keep(noteId: string, unlock: NoteUnlock) {
    this.setUnlocks({ ...this.unlocks.value, [noteId]: unlock });
  }

  private setUnlocks(unlocks: NoteUnlocks) {
    this.unlocks.value = unlocks;
    writeUnlocks(STORAGE_NAMES.unlocks(this.userId), unlocks);
  }
}
