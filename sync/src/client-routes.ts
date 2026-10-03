import type {
  PullRequest,
  PullResponse,
  PushRequest,
  PushResponse,
} from "@/lib/sync/protocol";
import { getServerByName } from "partyserver";
import { authorizeBatch } from "./app";
import type { Env } from "./env";

const noteDoc = (env: Env, id: string) => getServerByName(env.NoteDoc, id);

const reprojectWorkspace = async (env: Env, userId: string) => {
  const workspace = await getServerByName(env.WorkspaceDoc, userId);
  await workspace.project();
};

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
    targets.map(
      async (id) =>
        [id, await (await noteDoc(env, id)).diff(body.docs[id] ?? "")] as const,
    ),
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
  const writable = ids.filter((id) =>
    ["owner", "editor"].includes(access.roles[id] ?? ""),
  );
  const readonly = ids.filter((id) => access.roles[id] === "viewer");
  await Promise.all(
    writable.map(async (id) => (await noteDoc(env, id)).apply(body.docs[id]!)),
  );
  if (access.created.length) await reprojectWorkspace(env, access.userId);
  return { ok: writable, readonly, denied: access.denied };
};
