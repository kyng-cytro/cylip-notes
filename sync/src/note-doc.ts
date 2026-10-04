import { CLOSE_CODES, SAVE_DEBOUNCE } from "@/lib/sync/constants";
import { fromBase64, toBase64 } from "@/lib/sync/protocol";
import type { Connection, ConnectionContext } from "partyserver";
import { YServer } from "y-partyserver";
import * as Y from "yjs";
import { fetchNoteSeed, projectNote } from "./app";
import { workspaceDoc } from "./docs";
import type { Env, Identity } from "./env";
import { readIdentity } from "./identity";
import { loadState, saveState } from "./storage";

export class NoteDoc extends YServer<Env> {
  static callbackOptions = SAVE_DEBOUNCE.note;

  private deleted = false;

  async onLoad() {
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
    const { audience } = await projectNote(
      this.env,
      this.name,
      toBase64(state),
    );
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

  apply(update: string) {
    Y.applyUpdate(this.document, fromBase64(update));
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
