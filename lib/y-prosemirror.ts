import * as Y from "yjs";
import { getSchema } from "@tiptap/core";
import { extensions } from "@/lib/tiptap";
import { yXmlFragmentToProseMirrorRootNode } from "y-prosemirror";

export const getJsonFromDoc = (doc: Y.Doc) => {
  const schema = getSchema(extensions);
  return yXmlFragmentToProseMirrorRootNode(
    doc.getXmlElement("default"),
    schema,
  );
};
