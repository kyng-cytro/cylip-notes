import { getServerByName } from "partyserver";
import type { Env } from "./env";

export const noteDoc = (env: Env, noteId: string) =>
  getServerByName(env.NoteDoc, noteId);

export const workspaceDoc = (env: Env, userId: string) =>
  getServerByName(env.WorkspaceDoc, userId);

export const reprojectWorkspace = async (env: Env, userId: string) =>
  (await workspaceDoc(env, userId)).project();
