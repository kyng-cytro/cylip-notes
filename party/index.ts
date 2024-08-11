import * as Y from "yjs";
import { saveDoc, getEnvs, getParam, getDoc } from "./utils";
import { onConnect } from "y-partykit";
import type * as Party from "partykit/server";

export default class YjsServer implements Party.Server {
  constructor(public room: Party.Room) {}
  onConnect(conn: Party.Connection) {
    const roomId = this.room.id;
    const { apiKey, baseUrl } = getEnvs(this.room.env);
    const sessionToken = getParam(conn.uri, "auth_session");
    return onConnect(conn, this.room, {
      async load() {
        if (!apiKey || !baseUrl || !sessionToken) return new Y.Doc();
        return getDoc({ roomId, apiKey, baseUrl, sessionToken });
      },
      callback: {
        async handler(doc) {
          if (!apiKey || !baseUrl || !sessionToken) return;
          return saveDoc({ doc, roomId, apiKey, baseUrl, sessionToken });
        },
        debounceWait: 5000,
      },
    });
  }
}

YjsServer satisfies Party.Worker;
