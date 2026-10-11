import { CLOSE_CODES, SAVE_DEBOUNCE } from "@/constants";
import { fromBase64, toBase64 } from "@/lib/sync/protocol";
import type { Connection, ConnectionContext } from "partyserver";
import { YServer } from "y-partyserver";
import * as Y from "yjs";
import { fetchNoteSeed, projectNote } from "./app";
import { workspaceDoc } from "./docs";
import type { Env, Identity } from "./env";
import { readIdentity } from "./identity";
import { loadState, saveState } from "./storage";

const editorOf = (origin: unknown) =>
  typeof origin === "string"
    ? origin
    : (origin as Connection<Identity> | null)?.state?.userId;

export class NoteDoc extends YServer<Env> {
  static callbackOptions = SAVE_DEBOUNCE.note;

  private deleted = false;
  private editors = new Set<string>();

  async onLoad() {
    this.document.on("update", (_update, origin) => {
      const editor = editorOf(origin);
      if (editor) this.editors.add(editor);
    });
    const stored = loadState(this.ctx.storage);
    if (stored) {
      Y.applyUpdate(this.document, stored);
      return;
    }
    const seed = await this.fetchSeed();
    if (!seed) return;
    Y.applyUpdate(this.document, seed);
    saveState(this.ctx.storage, seed);
  }

  async onSave() {
    if (this.deleted) return;
    const state = Y.encodeStateAsUpdate(this.document);
    saveState(this.ctx.storage, state);
    const editors = this.editors;
    this.editors = new Set();
    const { audience } = await projectNote(this.env, this.name, {
      state: toBase64(state),
      editors: [...editors],
    }).catch((error) => {
      for (const editor of editors) this.editors.add(editor);
      throw error;
    });
    await Promise.allSettled(
      audience.map((userId) => this.notifyWorkspace(userId)),
    );
  }

  getConnectionTags(_connection: Connection, ctx: ConnectionContext) {
    return [readIdentity(ctx.request).userId];
  }

  onConnect(connection: Connection<Identity>, ctx: ConnectionContext) {
    connection.setState(readIdentity(ctx.request));
    super.onConnect(connection, ctx);
  }

  isReadOnly(connection: Connection<Identity>) {
    return connection.state?.role === "viewer";
  }

  diff(stateVector: string) {
    const vector = stateVector ? fromBase64(stateVector) : undefined;
    return {
      update: toBase64(Y.encodeStateAsUpdate(this.document, vector)),
      sv: toBase64(Y.encodeStateVector(this.document)),
    };
  }

  apply(update: string, userId: string) {
    Y.applyUpdate(this.document, fromBase64(update), userId);
  }

  disconnect(userId: string) {
    for (const connection of this.getConnections(userId)) {
      connection.close(CLOSE_CODES.accessChanged, "Access changed");
    }
  }

  async destroy() {
    this.deleted = true;
    for (const connection of this.getConnections()) {
      connection.close(CLOSE_CODES.noteDeleted, "Note deleted");
    }
    await this.ctx.storage.deleteAll();
  }

  private async fetchSeed() {
    const seed = await fetchNoteSeed(this.env, this.name);
    return seed ? fromBase64(seed) : null;
  }

  private async notifyWorkspace(userId: string) {
    await (await workspaceDoc(this.env, userId)).notifyNoteChanged(this.name);
  }
}
