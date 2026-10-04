import type { JSONContent } from "@tiptap/core";
import { blob } from "hub:blob";

const IMAGE_PREFIX = "note-images";

export const putNoteImage = async (userId: string, file: Blob) => {
  const extension = file.type.split("/")[1]?.replace("+xml", "") || "bin";
  const { pathname } = await blob.put(`${generateId(21)}.${extension}`, file, {
    prefix: `${IMAGE_PREFIX}/${userId}`,
    contentType: file.type,
  });
  return `${useRuntimeConfig().public.baseUrl}/${pathname.replace(IMAGE_PREFIX, "images")}`;
};

export const getNoteImage = (path: string) =>
  blob.get(`${IMAGE_PREFIX}/${path}`);

const dataUriToBlob = (uri: string) => {
  const match = uri.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!match) return null;
  const [, type = "application/octet-stream", base64, data = ""] = match;
  const bytes = base64
    ? Uint8Array.from(atob(data), (char) => char.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(data));
  return new Blob([bytes], { type });
};

const isInlineImage = (node: JSONContent) =>
  node.type === "image" &&
  typeof node.attrs?.src === "string" &&
  node.attrs.src.startsWith("data:");

const uploadInlineImage = async (node: JSONContent, userId: string) => {
  const file = dataUriToBlob(node.attrs!.src);
  if (!file) return node;
  const src = await putNoteImage(userId, file);
  return { ...node, attrs: { ...node.attrs, src } };
};

const replaceInlineImages = async (
  node: JSONContent,
  userId: string,
): Promise<JSONContent> => {
  const next = isInlineImage(node)
    ? await uploadInlineImage(node, userId)
    : node;
  if (!next.content) return next;
  const content = await Promise.all(
    next.content.map((child) => replaceInlineImages(child, userId)),
  );
  return { ...next, content };
};

const hasInlineImages = (node: JSONContent): boolean =>
  isInlineImage(node) || !!node.content?.some(hasInlineImages);

export const extractInlineImages = async (
  content: JSONContent,
  userId: string,
) => {
  if (!hasInlineImages(content)) return null;
  return replaceInlineImages(content, userId);
};
