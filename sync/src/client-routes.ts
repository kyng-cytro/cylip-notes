import {
  canEdit,
  type PullRequest,
  type PullResponse,
  type PushRequest,
  type PushResponse,
} from "@/lib/sync/protocol";
import { authorizeBatch } from "./app";
import { noteDoc, reprojectWorkspace } from "./docs";
import type { Env } from "./env";

export const pull = async (
  env: Env,
  token: string,
  body: PullRequest,
): Promise<PullResponse> => {
  const ids = Object.keys(body.docs);
  const access = await authorizeBatch(env, {
    token,
    ids,
    create: false,
    since: body.since,
  });
  const missingLocally = ids.filter((id) => !body.docs[id] && access.roles[id]);
  const targets = [...new Set([...access.changed, ...missingLocally])];
  const diffs = await Promise.all(
    targets.map(async (id) => [
      id,
      await (await noteDoc(env, id)).diff(body.docs[id] ?? ""),
    ]),
  );
  return {
    cursor: access.cursor,
    docs: Object.fromEntries(diffs),
    denied: access.denied,
  };
};

export const push = async (
  env: Env,
  token: string,
  body: PushRequest,
): Promise<PushResponse> => {
  const ids = Object.keys(body.docs);
  const access = await authorizeBatch(env, { token, ids, create: true });
  const writable = ids.filter((id) => canEdit(access.roles[id]));
  const readonly = ids.filter((id) => access.roles[id] === "viewer");
  await Promise.all(
    writable.map(async (id) => (await noteDoc(env, id)).apply(body.docs[id]!)),
  );
  if (access.created.length) await reprojectWorkspace(env, access.userId);
  return { ok: writable, readonly, denied: access.denied };
};
