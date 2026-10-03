import * as Y from "yjs";
import { CONTENT_FIELD } from "./protocol";

const isInlineImage = (node: Y.AbstractType<unknown>) =>
  node instanceof Y.XmlElement &&
  node.nodeName === "image" &&
  String(node.getAttribute("src") ?? "").startsWith("data:");

const findInlineImages = (doc: Y.Doc) =>
  [
    ...doc.getXmlFragment(CONTENT_FIELD).createTreeWalker(isInlineImage),
  ] as Y.XmlElement[];

export const uploadInlineImages = async (
  doc: Y.Doc,
  upload: (file: Blob) => Promise<string>,
) => {
  for (const image of findInlineImages(doc)) {
    const source = image.getAttribute("src") as string;
    const file = await fetch(source).then((response) => response.blob());
    const url = await upload(file);
    doc.transact(() => {
      if (image.getAttribute("src") === source) image.setAttribute("src", url);
    });
  }
};
