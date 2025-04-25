import { extensions } from "@/lib/tiptap";
import { getSchema, type JSONContent } from "@tiptap/core";
import {
  prosemirrorJSONToYDoc,
  yXmlFragmentToProseMirrorRootNode,
} from "y-prosemirror";
import * as Y from "yjs";

export const getYdocFromJson = (doc: JSONContent) => {
  const schema = getSchema(extensions);
  return prosemirrorJSONToYDoc(schema, doc, "default");
};

export const getJsonFromDoc = (doc: Y.Doc) => {
  const schema = getSchema(extensions);
  return yXmlFragmentToProseMirrorRootNode(
    doc.getXmlElement("default"),
    schema,
  ).toJSON();
};
