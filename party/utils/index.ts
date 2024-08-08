import * as Y from "yjs";
import { getJsonFromDoc } from "@/lib/y-prosemirror";

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

export const getDoc = ({ roomId }: { roomId: string }) => {};

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
  const jsonContent = getJsonFromDoc(doc);
  const uint8Content = Y.encodeStateAsUpdateV2(doc);
  const data = { jsonContent, uint8Content };
  const res = await fetch(`${baseUrl}/api/notes/partykit/${roomId}`, {
    method: "PUT",
    headers: {
      "x-api-key": apiKey,
      "x-session-id": sessionToken,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to save document to database");
  }
};
