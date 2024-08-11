import * as Y from "yjs";
import { getSchema, type JSONContent } from "@tiptap/core";
import { extensions } from "@/lib/tiptap";
import {
  yXmlFragmentToProseMirrorRootNode,
  prosemirrorJSONToYDoc,
} from "y-prosemirror";

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
