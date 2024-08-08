import * as Y from "yjs";
import { apiKey, baseUrl } from "./constants";
import { getJsonFromDoc } from "@/lib/y-prosemirror";

export const getDoc = (roomId: string) => {};

export const saveDoc = async (
  doc: Y.Doc,
  roomId: string,
  sessionToken: string,
) => {
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
