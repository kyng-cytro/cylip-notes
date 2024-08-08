import * as Y from "yjs";
import { saveDoc } from "./utils";
import { onConnect } from "y-partykit";
import type * as Party from "partykit/server";

export default class YjsServer implements Party.Server {
  constructor(public room: Party.Room) {}
  onConnect(conn: Party.Connection) {
    return onConnect(conn, this.room, {
      async load() {
        return new Y.Doc();
      },
      callback: {
        async handler(yDoc) {
          saveDoc(yDoc, "hello", "");
        },
        debounceWait: 10000,
        debounceMaxWait: 20000,
      },
    });
  }
}

YjsServer satisfies Party.Worker;
