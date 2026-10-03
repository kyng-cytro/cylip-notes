import type { NoteDoc } from "./note-doc";
import type { WorkspaceDoc } from "./workspace-doc";

export type Env = {
  APP_URL: string;
  SYNC_SECRET: string;
  NoteDoc: DurableObjectNamespace<NoteDoc>;
  WorkspaceDoc: DurableObjectNamespace<WorkspaceDoc>;
};

export type Identity = {
  userId: string;
  name: string;
  role: "owner" | "editor" | "viewer";
};
