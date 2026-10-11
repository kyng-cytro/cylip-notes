import { BLOB_PREFIXES } from "@/constants";
import type { JSONContent } from "@tiptap/core";
import { blob } from "hub:blob";

type StoredImage = Awaited<ReturnType<typeof blob.list>>["blobs"][number];

export const putNoteImage = async (userId: string, file: Blob) => {
  const extension = file.type.split("/")[1]?.replace("+xml", "") || "bin";
  const { pathname } = await blob.put(`${generateId(21)}.${extension}`, file, {
    prefix: `${BLOB_PREFIXES.noteImages}/${userId}`,
    contentType: file.type,
  });
  return `${useRuntimeConfig().public.baseUrl}/${pathname.replace(BLOB_PREFIXES.noteImages, "images")}`;
};

export const getNoteImage = (path: string) =>
  blob.get(`${BLOB_PREFIXES.noteImages}/${path}`);

export const listNoteImages = async () => {
  const images: StoredImage[] = [];
  let cursor: string | undefined;
  do {
    const page = await blob.list({ prefix: BLOB_PREFIXES.noteImages, cursor });
    images.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return images;
};

export const deleteNoteImages = (pathnames: string[]) => blob.del(pathnames);

const imageSources = (node: JSONContent): string[] => [
  ...(node.type === "image" && typeof node.attrs?.src === "string"
    ? [node.attrs.src]
    : []),
  ...(node.content ?? []).flatMap(imageSources),
];

const toImagePathname = (src: string) => {
  const { pathname } = new URL(src, useRuntimeConfig().public.baseUrl);
  return pathname.startsWith("/images/")
    ? `${BLOB_PREFIXES.noteImages}${pathname.slice("/images".length)}`
    : null;
};

export const findUsedNoteImages = async () => {
  const notes = await useDrizzle().query.note.findMany({
    columns: { content: true },
  });
  return new Set(
    notes
      .flatMap((note) => (note.content ? imageSources(note.content) : []))
      .map(toImagePathname)
      .filter((pathname) => pathname !== null),
  );
};

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
