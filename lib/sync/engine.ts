import { SYNC_TIMING } from "./constants";
import { ref, shallowRef } from "vue";
import * as Y from "yjs";
import { uploadInlineImages } from "./inline-images";
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
  readonly ready = ref(false);
  readonly caughtUp = ref(false);
  readonly status = ref<SyncStatus>("synced");

  readonly workspaceDoc: Workspace;
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

  constructor(private options: Options) {
    this.state = new SyncState(options.userId);
    this.api = new SyncApi(options.syncUrl, options.getToken);
    this.docs = new NoteDocs(options.userId, {
      onLocalChange: (noteId) => this.handleLocalChange(noteId),
      onChange: (noteId) => this.scheduleViewRefresh(noteId),
    });
    this.workspaceDoc = new Workspace({
      ...options,
      onChange: () => this.handleWorkspaceChange(),
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
    this.workspace.value = this.workspaceDoc.snapshot();
    const ids = Object.keys(this.workspace.value.notes);
    await Promise.all(ids.map((id) => this.docs.load(id)));
    this.views.value = Object.fromEntries(
      ids.map((id) => [id, readNoteView(id, this.docs.get(id))]),
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
    if (clearData)
      await Promise.all([this.docs.removeAll(), this.state.clear()]);
  }

  loadNoteDoc(noteId: string) {
    return this.docs.load(noteId);
  }

  updateNoteMeta(noteId: string, values: Partial<NoteMeta>) {
    const doc = this.docs.get(noteId);
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
    clearTimeout(this.catchUpTimer);
    this.flushViews();
    this.caughtUp.value = true;
  };

  private async sync() {
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
    const pending = await this.notesWithUnsyncedChanges();
    if (!pending.length) return;
    await Promise.all(
      pending.map((id) =>
        uploadInlineImages(this.docs.get(id), this.options.uploadImage),
      ),
    );
    const vectors = new Map(
      pending.map((id) => [id, Y.encodeStateVector(this.docs.get(id))]),
    );
    const updates = await Promise.all(
      pending.map(async (id) => [id, await this.diffSinceServer(id)]),
    );
    const result = await this.api.push({ docs: Object.fromEntries(updates) });
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
    });
    for (const [id, { update, sv }] of Object.entries(result.docs)) {
      if (!this.docs.has(id)) continue;
      Y.applyUpdate(this.docs.get(id), fromBase64(update), "remote");
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
    const local = Y.decodeStateVector(
      Y.encodeStateVector(this.docs.get(noteId)),
    );
    const stored = await this.state.getServerVector(noteId);
    const server = stored
      ? Y.decodeStateVector(stored)
      : new Map<number, number>();
    return [...local].some(
      ([client, clock]) => (server.get(client) ?? 0) < clock,
    );
  }

  private async diffSinceServer(noteId: string) {
    const serverVector = await this.state.getServerVector(noteId);
    return toBase64(Y.encodeStateAsUpdate(this.docs.get(noteId), serverVector));
  }

  private async localVector(noteId: string) {
    const doc = this.docs.get(noteId);
    const hasLocalState = doc.store.clients.size > 0;
    const hasServerState = !!(await this.state.getServerVector(noteId));
    return hasLocalState && hasServerState
      ? toBase64(Y.encodeStateVector(doc))
      : "";
  }

  private dropNotes(noteIds: string[]) {
    for (const id of noteIds) this.workspaceDoc.removeNote(id);
  }

  private handleWorkspaceChange() {
    this.workspace.value = this.workspaceDoc.snapshot();
    const wanted = new Set(Object.keys(this.workspace.value.notes));
    const added = [...wanted].filter((id) => !this.docs.has(id));
    const removed = this.docs.ids().filter((id) => !wanted.has(id));
    for (const id of added)
      this.docs.load(id).then(() => this.scheduleViewRefresh(id));
    for (const id of removed) this.forgetNote(id);
    if (added.length) this.requestSync();
  }

  private async forgetNote(noteId: string) {
    await Promise.all([this.docs.remove(noteId), this.state.forget(noteId)]);
    const { [noteId]: _, ...views } = this.views.value;
    this.views.value = views;
  }

  private handleLocalChange(noteId: string) {
    queueMicrotask(() => this.touchUpdatedAt(noteId));
    this.requestSync();
  }

  private touchUpdatedAt(noteId: string) {
    if (!this.docs.has(noteId)) return;
    const meta = getMeta(this.docs.get(noteId));
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
      .map((id) => [id, readNoteView(id, this.docs.get(id))]);
    this.staleViews.clear();
    this.views.value = { ...this.views.value, ...Object.fromEntries(fresh) };
  }
}
