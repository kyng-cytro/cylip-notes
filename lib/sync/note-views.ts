import { DOC_KEYS } from "./constants";
import { extensions } from "@/lib/tiptap";
import { getSchema, type JSONContent } from "@tiptap/core";
import { yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import type * as Y from "yjs";
import { readMeta, type NoteMeta } from "./protocol";

const schema = getSchema(extensions);

export type NoteView = NoteMeta & {
  id: string;
  content: JSONContent | null;
  text: string;
};

export const readNoteView = (id: string, doc: Y.Doc): NoteView => {
  const fragment = doc.getXmlFragment(DOC_KEYS.content);
  const node = yXmlFragmentToProseMirrorRootNode(fragment, schema);
  return {
    id,
    ...readMeta(doc),
    content: fragment.length ? (node.toJSON() as JSONContent) : null,
    text: node.textContent,
  };
};
