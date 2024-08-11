import * as Y from "yjs";
import type { JSONContent } from "@tiptap/core";
import { ofetch } from "ofetch";
import { getJsonFromDoc, getYdocFromJson } from "@/lib/y-prosemirror";

export const getParam = (url: string, param: string) => {
  const value = new URL(url).searchParams.get(param);
  if (!value) return null;
  return value;
};

export const getEnvs = (env: Record<string, unknown>) => {
  const apiKey = (env.apiKey as string) || "123";
  const baseUrl = (env.baseUrl as string) || "http://localhost:3000";
  return { apiKey, baseUrl };
};

export const getDoc = async ({
  roomId,
  apiKey,
  baseUrl,
  sessionToken,
}: {
  roomId: string;
  apiKey: string;
  baseUrl: string;
  sessionToken: string;
}) => {
  try {
    const res = await ofetch<{ id: string; content: JSONContent | null }>(
      `${baseUrl}/api/notes/websocket/${roomId}`,
      {
        headers: {
          "x-api-key": apiKey,
          "x-session-id": sessionToken,
        },
      },
    );
    if (!res.content) return new Y.Doc();
    return getYdocFromJson(res.content);
  } catch (e) {
    console.error({ e });
    return new Y.Doc();
  }
};

export const saveDoc = async ({
  doc,
  roomId,
  apiKey,
  baseUrl,
  sessionToken,
}: {
  doc: Y.Doc;
  roomId: string;
  apiKey: string;
  baseUrl: string;
  sessionToken: string;
}) => {
  try {
    const content = getJsonFromDoc(doc);
    const data = { content };
    await ofetch(`${baseUrl}/api/notes/websocket/${roomId}`, {
      method: "PUT",
      headers: {
        "x-api-key": apiKey,
        "x-session-id": sessionToken,
      },
      body: data,
    });
  } catch (e) {
    console.error({ e });
  }
};
