import { SYNC_TIMING } from "@/constants";
import { ref, shallowRef } from "vue";
import * as Y from "yjs";
import { countChanges, type ChangeCount } from "./change-count";
import { uploadInlineImages } from "./inline-images";
import { LockedNotes, type ServerUnlock } from "./locked-notes";
import { NoteDocs } from "./note-docs";
import { readNoteView, type NoteView } from "./note-views";
import {
  fromBase64,
  getMeta,
  toBase64,
  writeMap,
  type NoteMeta,
  type WorkspaceSnapshot,
} from "./protocol";
import { SyncApi } from "./sync-api";
import { SyncState } from "./sync-state";
import { Workspace } from "./workspace";

type SyncStatus = "offline" | "syncing" | "synced";

export type BlockedNote = ChangeCount & { noteId: string };

type Options = {
  userId: string;
  syncUrl: string;
  getToken: () => Promise<string>;
  uploadImage: (file: Blob) => Promise<string>;
  onInvitesChanged: () => void;
};

export class SyncEngine {
  readonly workspace = shallowRef<WorkspaceSnapshot>({ notes: {}, labels: {} });
  readonly views = shallowRef<Record<string, NoteView>>({});
  readonly blocked = shallowRef<BlockedNote[]>([]);
  readonly ready = ref(false);
  readonly caughtUp = ref(false);
  readonly status = ref<SyncStatus>("synced");

  readonly workspaceDoc: Workspace;
  readonly locks: LockedNotes;
  private docs: NoteDocs;
  private state: SyncState;
  private api: SyncApi;

  private syncTimer: ReturnType<typeof setTimeout> | undefined;
  private syncInterval: ReturnType<typeof setInterval> | undefined;
  private catchUpTimer: ReturnType<typeof setTimeout> | undefined;
  private workspaceSynced = false;
  private viewTimer: ReturnType<typeof setTimeout> | undefined;
  private staleViews = new Set<string>();
  private syncing = false;
  private syncQueued = false;
  private snapshot: WorkspaceSnapshot = { notes: {}, labels: {} };

  constructor(private options: Options) {
    this.state = new SyncState(options.userId);
    this.locks = new LockedNotes(options.userId);
    this.api = new SyncApi(options.syncUrl, options.getToken);
    this.docs = new NoteDocs(options.userId, {
      onLocalChange: (noteId) => this.handleLocalChange(noteId),
      onChange: (noteId) => this.handleNoteChange(noteId),
    });
    this.workspaceDoc = new Workspace({
      ...options,
      onChange: (local) => this.handleWorkspaceChange(local),
      onConnect: () => this.requestSync(),
      onSynced: () => {
        this.workspaceSynced = true;
        this.syncNow();
      },
      onNoteChanged: () => this.requestSync(),
    });
  }

  async start() {
    await this.workspaceDoc.load();
    this.snapshot = this.workspaceDoc.snapshot();
    this.workspace.value = this.snapshot;
    const ids = this.loadableNoteIds();
    await Promise.all(ids.map((id) => this.loadDoc(id)));
    this.views.value = Object.fromEntries(
      ids.map((id) => [id, readNoteView(id, this.doc(id))]),
    );
    this.ready.value = true;
    this.catchUpTimer = setTimeout(
      this.markCaughtUp,
      SYNC_TIMING.catchUpTimeout,
    );
    this.workspaceDoc.connect();
    window.addEventListener("online", this.requestSync);
    window.addEventListener("offline", this.markOffline);
    document.addEventListener("visibilitychange", this.requestSync);
    this.syncInterval = setInterval(this.requestSync, SYNC_TIMING.syncInterval);
    this.requestSync();
  }

  async stop({ clearData }: { clearData: boolean }) {
    clearTimeout(this.syncTimer);
    clearTimeout(this.viewTimer);
    clearTimeout(this.catchUpTimer);
    clearInterval(this.syncInterval);
    window.removeEventListener("online", this.requestSync);
    window.removeEventListener("offline", this.markOffline);
    document.removeEventListener("visibilitychange", this.requestSync);
    await this.workspaceDoc.destroy({ clearData });
    this.docs.close();
    if (clearData) {
      await Promise.all([
        this.docs.removeAll(),
        this.state.clear(),
        this.locks.clear(),
      ]);
    }
  }

  loadNoteDoc(noteId: string) {
    return this.loadDoc(noteId);
  }

  canOpen(noteId: string) {
    if (!this.isLocked(noteId)) return true;
    if (this.status.value === "offline") return this.hasKey(noteId);
    return !!this.token(noteId);
  }

  unlockToken(noteId: string) {
    return this.token(noteId) ?? "";
  }

  async unlockOnline(noteId: string, password: string, server: ServerUnlock) {
    await this.locks.unlockOnline(noteId, password, server);
    this.handleWorkspaceChange();
    this.requestSync();
  }

  async unlockOffline(noteId: string, password: string) {
    await this.locks.unlockOffline(noteId, password, this.lockedAt(noteId)!);
    this.handleWorkspaceChange();
  }

  async discardLocalChanges(noteId: string) {
    await this.locks.forget(noteId);
    await this.forgetNote(noteId);
    this.blocked.value = this.blocked.value.filter(
      (note) => note.noteId !== noteId,
    );
    this.handleWorkspaceChange();
  }

  updateNoteMeta(noteId: string, values: Partial<NoteMeta>) {
    const doc = this.doc(noteId);
    doc.transact(() => writeMap(getMeta(doc), values));
    this.flushViews();
  }

  syncNow() {
    clearTimeout(this.syncTimer);
    return this.sync();
  }

  requestSync = () => {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.sync(), SYNC_TIMING.syncDelay);
  };

  private markOffline = () => {
    this.status.value = "offline";
    this.markCaughtUp();
  };

  private markCaughtUp = () => {
    if (this.caughtUp.value) return;
    clearTimeout(this.catchUpTimer);
    this.caughtUp.value = true;
    this.publish();
  };

  private publish() {
    this.workspace.value = this.snapshot;
    this.flushViews();
  }

  private async sync() {
    this.locks.dropExpiredTokens();
    if (this.syncing) {
      this.syncQueued = true;
      return;
    }
    if (!navigator.onLine) return this.markOffline();
    this.syncing = true;
    this.status.value = "syncing";
    try {
      await this.pushChanges();
      await this.pullChanges();
      this.status.value = "synced";
      if (this.workspaceSynced) this.markCaughtUp();
    } catch {
      this.markOffline();
    } finally {
      this.syncing = false;
      if (this.syncQueued) {
        this.syncQueued = false;
        this.requestSync();
      }
    }
  }

  private async pushChanges() {
    const unsynced = await this.notesWithUnsyncedChanges();
    const isBlocked = (id: string) => this.isLocked(id) && !this.token(id);
    this.blocked.value = await Promise.all(
      unsynced.filter(isBlocked).map((id) => this.blockedNote(id)),
    );
    const pending = unsynced.filter((id) => !isBlocked(id));
    if (!pending.length) return;
    await Promise.all(
      pending.map((id) =>
        uploadInlineImages(this.doc(id), this.options.uploadImage),
      ),
    );
    const vectors = new Map(
      pending.map((id) => [id, Y.encodeStateVector(this.doc(id))]),
    );
    const updates = await Promise.all(
      pending.map(async (id) => [id, await this.diffSinceServer(id)]),
    );
    const result = await this.api.push({
      docs: Object.fromEntries(updates),
      unlocks: this.unlockTokens(),
    });
    for (const id of [...result.ok, ...result.readonly]) {
      await this.state.setServerVector(id, vectors.get(id)!);
    }
    this.dropNotes(result.denied);
  }

  private async pullChanges() {
    const ids = this.docs.ids();
    const vectors = await Promise.all(
      ids.map(async (id) => [id, await this.localVector(id)]),
    );
    const result = await this.api.pull({
      docs: Object.fromEntries(vectors),
      since: await this.state.getCursor(),
      unlocks: this.unlockTokens(),
    });
    for (const [id, { update, sv }] of Object.entries(result.docs)) {
      if (!this.docs.has(id)) continue;
      Y.applyUpdate(this.doc(id), fromBase64(update), "remote");
      await this.state.setServerVector(id, fromBase64(sv));
    }
    this.dropNotes(result.denied);
    await this.state.setCursor(result.cursor);
  }

  private async notesWithUnsyncedChanges() {
    const ids = this.docs.ids();
    const flags = await Promise.all(
      ids.map((id) => this.hasUnsyncedChanges(id)),
    );
    return ids.filter((_, i) => flags[i]);
  }

  private async hasUnsyncedChanges(noteId: string) {
    const local = Y.decodeStateVector(Y.encodeStateVector(this.doc(noteId)));
    const stored = await this.state.getServerVector(noteId);
    const server = stored
      ? Y.decodeStateVector(stored)
      : new Map<number, number>();
    return [...local].some(
      ([client, clock]) => (server.get(client) ?? 0) < clock,
    );
  }

  private async blockedNote(noteId: string): Promise<BlockedNote> {
    const serverVector = await this.state.getServerVector(noteId);
    const update = Y.encodeStateAsUpdate(this.doc(noteId), serverVector);
    return { noteId, ...countChanges(update, serverVector) };
  }

  private async diffSinceServer(noteId: string) {
    const serverVector = await this.state.getServerVector(noteId);
    return toBase64(Y.encodeStateAsUpdate(this.doc(noteId), serverVector));
  }

  private async localVector(noteId: string) {
    const doc = this.doc(noteId);
    const hasLocalState = doc.store.clients.size > 0;
    const hasServerState = !!(await this.state.getServerVector(noteId));
    return hasLocalState && hasServerState
      ? toBase64(Y.encodeStateVector(doc))
      : "";
  }

  private doc(noteId: string) {
    return this.docs.get(noteId, !this.isLocked(noteId));
  }

  private async loadDoc(noteId: string) {
    const opening = !this.docs.has(noteId);
    const doc = await this.docs.load(noteId, !this.isLocked(noteId));
    if (opening && this.isLocked(noteId)) await this.locks.restore(noteId, doc);
    return doc;
  }

  private lockedAt(noteId: string) {
    return this.snapshot.notes[noteId]?.lockedAt;
  }

  private isLocked(noteId: string) {
    return !!this.lockedAt(noteId);
  }

  private hasKey(noteId: string) {
    return this.locks.hasKey(noteId, this.lockedAt(noteId));
  }

  private token(noteId: string) {
    return this.locks.token(noteId, this.lockedAt(noteId));
  }

  private loadableNoteIds() {
    return Object.keys(this.snapshot.notes).filter(
      (id) => !this.isLocked(id) || this.hasKey(id),
    );
  }

  private unlockTokens() {
    const tokens: Record<string, string> = {};
    for (const id of this.docs.ids()) {
      const token = this.token(id);
      if (token) tokens[id] = token;
    }
    return tokens;
  }

  private dropNotes(noteIds: string[]) {
    for (const id of noteIds) this.workspaceDoc.removeNote(id);
  }

  private handleWorkspaceChange(local = true) {
    this.snapshot = this.workspaceDoc.snapshot();
    if (this.caughtUp.value) this.workspace.value = this.snapshot;
    else if (local) this.publish();
    const wanted = new Set(this.loadableNoteIds());
    const added = [...wanted].filter((id) => !this.docs.has(id));
    const removed = this.docs.ids().filter((id) => !wanted.has(id));
    for (const id of added)
      this.loadDoc(id).then(() => this.scheduleViewRefresh(id));
    for (const id of removed) this.forgetNote(id);
    for (const id of this.docs.ids()) {
      this.docs.setPersisted(id, !this.isLocked(id));
      if (this.isLocked(id)) this.locks.scheduleSave(id, this.doc(id));
    }
    this.locks.pruneCopies((id) => this.lockedAt(id));
    if (added.length) this.requestSync();
  }

  private async forgetNote(noteId: string) {
    this.locks.cancelSave(noteId);
    await Promise.all([this.docs.remove(noteId), this.state.forget(noteId)]);
    const { [noteId]: _, ...views } = this.views.value;
    this.views.value = views;
  }

  private handleNoteChange(noteId: string) {
    this.scheduleViewRefresh(noteId);
    if (this.isLocked(noteId) && this.docs.has(noteId)) {
      this.locks.scheduleSave(noteId, this.doc(noteId));
    }
  }

  private handleLocalChange(noteId: string) {
    queueMicrotask(() => this.touchUpdatedAt(noteId));
    this.requestSync();
  }

  private touchUpdatedAt(noteId: string) {
    if (!this.docs.has(noteId)) return;
    const meta = getMeta(this.doc(noteId));
    const now = Date.now();
    if (
      now - ((meta.get("updatedAt") as number) ?? 0) >
      SYNC_TIMING.updatedAtThrottle
    ) {
      meta.set("updatedAt", now);
    }
  }

  private scheduleViewRefresh(noteId: string) {
    this.staleViews.add(noteId);
    if (!this.caughtUp.value) return;
    clearTimeout(this.viewTimer);
    this.viewTimer = setTimeout(
      () => this.flushViews(),
      SYNC_TIMING.viewRefreshDelay,
    );
  }

  private flushViews() {
    clearTimeout(this.viewTimer);
    const fresh = [...this.staleViews]
      .filter((id) => this.docs.has(id))
      .map((id) => [id, readNoteView(id, this.doc(id))]);
    this.staleViews.clear();
    this.views.value = { ...this.views.value, ...Object.fromEntries(fresh) };
  }
}
