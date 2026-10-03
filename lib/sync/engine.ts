import { ref, shallowRef } from "vue";
import * as Y from "yjs";
import { uploadInlineImages } from "./inline-images";
import { NoteDocs } from "./note-docs";
import { readNoteView, type NoteView } from "./note-views";
import {
  fromBase64,
  getMeta,
  toBase64,
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
};

const SYNC_DELAY = 1000;
const SYNC_INTERVAL = 60_000;
const VIEW_DELAY = 150;
const UPDATED_AT_THROTTLE = 30_000;

const sameVector = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((byte, i) => byte === b[i]);

export class SyncEngine {
  readonly workspace = shallowRef<WorkspaceSnapshot>({ notes: {}, labels: {} });
  readonly views = shallowRef<Record<string, NoteView>>({});
  readonly ready = ref(false);
  readonly status = ref<SyncStatus>("synced");

  readonly docs: NoteDocs;
  readonly workspaceDoc: Workspace;
  private state: SyncState;
  private api: SyncApi;

  private syncTimer: ReturnType<typeof setTimeout> | undefined;
  private syncInterval: ReturnType<typeof setInterval> | undefined;
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
    this.workspaceDoc.connect();
    window.addEventListener("online", this.requestSync);
    window.addEventListener("offline", this.markOffline);
    document.addEventListener("visibilitychange", this.requestSync);
    this.syncInterval = setInterval(this.requestSync, SYNC_INTERVAL);
    this.requestSync();
  }

  async stop({ clearData }: { clearData: boolean }) {
    clearTimeout(this.syncTimer);
    clearTimeout(this.viewTimer);
    clearInterval(this.syncInterval);
    window.removeEventListener("online", this.requestSync);
    window.removeEventListener("offline", this.markOffline);
    document.removeEventListener("visibilitychange", this.requestSync);
    await this.workspaceDoc.destroy({ clearData });
    if (clearData)
      await Promise.all([this.docs.removeAll(), this.state.clear()]);
  }

  syncNow() {
    clearTimeout(this.syncTimer);
    return this.sync();
  }

  requestSync = () => {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.sync(), SYNC_DELAY);
  };

  private markOffline = () => {
    this.status.value = "offline";
  };

  private async sync() {
    if (this.syncing) {
      this.syncQueued = true;
      return;
    }
    if (!navigator.onLine) {
      this.status.value = "offline";
      return;
    }
    this.syncing = true;
    this.status.value = "syncing";
    try {
      await this.pushChanges();
      await this.pullChanges();
      this.status.value = "synced";
    } catch {
      this.status.value = "offline";
    } finally {
      this.syncing = false;
      if (this.syncQueued) {
        this.syncQueued = false;
        this.requestSync();
      }
    }
  }

  private async pushChanges() {
    const dirty = (await this.state.getDirty()).filter((id) =>
      this.docs.has(id),
    );
    if (!dirty.length) return;
    await Promise.all(
      dirty.map((id) =>
        uploadInlineImages(this.docs.get(id), this.options.uploadImage),
      ),
    );
    const vectors = new Map(
      dirty.map((id) => [id, Y.encodeStateVector(this.docs.get(id))]),
    );
    const updates = await Promise.all(
      dirty.map(async (id) => [id, await this.diffSinceServer(id)]),
    );
    const result = await this.api.push({ docs: Object.fromEntries(updates) });
    for (const id of [...result.ok, ...result.readonly]) {
      const vector = vectors.get(id)!;
      await this.state.setServerVector(id, toBase64(vector));
      if (sameVector(vector, Y.encodeStateVector(this.docs.get(id)))) {
        await this.state.clearDirty(id);
      }
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
      await this.state.setServerVector(id, sv);
    }
    this.dropNotes(result.denied);
    await this.state.setCursor(result.cursor);
  }

  private async diffSinceServer(noteId: string) {
    const serverVector = await this.state.getServerVector(noteId);
    const update = Y.encodeStateAsUpdate(
      this.docs.get(noteId),
      serverVector ? fromBase64(serverVector) : undefined,
    );
    return toBase64(update);
  }

  private async localVector(noteId: string) {
    const hasServerState = !!(await this.state.getServerVector(noteId));
    return hasServerState
      ? toBase64(Y.encodeStateVector(this.docs.get(noteId)))
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
    this.state.markDirty(noteId).then(this.requestSync);
  }

  private touchUpdatedAt(noteId: string) {
    if (!this.docs.has(noteId)) return;
    const meta = getMeta(this.docs.get(noteId));
    const now = Date.now();
    if (now - ((meta.get("updatedAt") as number) ?? 0) > UPDATED_AT_THROTTLE) {
      meta.set("updatedAt", now);
    }
  }

  private scheduleViewRefresh(noteId: string) {
    this.staleViews.add(noteId);
    clearTimeout(this.viewTimer);
    this.viewTimer = setTimeout(() => this.refreshViews(), VIEW_DELAY);
  }

  private refreshViews() {
    const fresh = [...this.staleViews]
      .filter((id) => this.docs.has(id))
      .map((id) => [id, readNoteView(id, this.docs.get(id))]);
    this.staleViews.clear();
    this.views.value = { ...this.views.value, ...Object.fromEntries(fresh) };
  }
}
