import { VERSION_CHANGE } from "@/constants";
import type { JSONContent } from "@tiptap/core";
import { diffArrays } from "diff";

type ChangeKind = "added" | "removed";

const INLINE_TYPES = new Set(["text", "hardBreak"]);

const WORDS = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

const isSame = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const isTextblock = (node: JSONContent) =>
  (node.content ?? []).every((child) => INLINE_TYPES.has(child.type!));

const canPair = (before: JSONContent, after: JSONContent) =>
  before.type === after.type && isSame(before.attrs, after.attrs);

const markBlock = (node: JSONContent, kind: ChangeKind): JSONContent => ({
  ...node,
  attrs: { ...node.attrs, [VERSION_CHANGE]: kind },
});

const markText = (node: JSONContent, kind: ChangeKind): JSONContent => ({
  ...node,
  marks: [...(node.marks ?? []), { type: VERSION_CHANGE, attrs: { kind } }],
});

const tokenize = (content: JSONContent[] = []) =>
  content.flatMap((node) =>
    node.type === "text"
      ? (node.text?.match(WORDS) ?? []).map((text) => ({ ...node, text }))
      : [node],
  );

const canMerge = (last: JSONContent | undefined, node: JSONContent) =>
  last?.type === "text" &&
  node.type === "text" &&
  isSame(last.marks, node.marks);

const mergeText = (nodes: JSONContent[]) => {
  const merged: JSONContent[] = [];
  for (const node of nodes) {
    const last = merged.at(-1);
    if (canMerge(last, node)) last!.text += node.text!;
    else merged.push({ ...node });
  }
  return merged;
};

const markTokens = (tokens: JSONContent[], kind: ChangeKind) =>
  kind === "added"
    ? tokens.map((node) => (node.type === "text" ? markText(node, kind) : node))
    : tokens
        .filter((node) => node.type === "text")
        .map((node) => markText(node, kind));

const diffInline = (before: JSONContent[] = [], after: JSONContent[] = []) => {
  const parts = diffArrays(tokenize(before), tokenize(after), {
    comparator: isSame,
  });
  return mergeText(
    parts.flatMap(({ added, removed, value }) => {
      if (added) return markTokens(value, "added");
      if (removed) return markTokens(value, "removed");
      return value;
    }),
  );
};

const changedBlock = (
  before?: JSONContent,
  after?: JSONContent,
): JSONContent[] => {
  if (!before) return [markBlock(after!, "added")];
  if (!after) return [markBlock(before, "removed")];
  if (!canPair(before, after) || !after.content) {
    return [markBlock(before, "removed"), markBlock(after, "added")];
  }
  const content =
    isTextblock(before) && isTextblock(after)
      ? diffInline(before.content, after.content)
      : diffBlocks(before.content, after.content);
  return [{ ...after, content }];
};

const pairBlocks = (removed: JSONContent[], added: JSONContent[]) =>
  Array.from({ length: Math.max(removed.length, added.length) }, (_, index) =>
    changedBlock(removed[index], added[index]),
  ).flat();

const diffBlocks = (before: JSONContent[] = [], after: JSONContent[] = []) => {
  const parts = diffArrays(before, after, { comparator: isSame });
  const blocks: JSONContent[] = [];
  for (let index = 0; index < parts.length; index++) {
    const { added, removed, value } = parts[index]!;
    const next = parts[index + 1];
    if (removed && next?.added) {
      blocks.push(...pairBlocks(value, next.value));
      index++;
    } else if (added || removed) {
      blocks.push(
        ...value.map((node) => markBlock(node, added ? "added" : "removed")),
      );
    } else {
      blocks.push(...value);
    }
  }
  return blocks;
};

export const diffVersions = (
  previous: JSONContent | null | undefined,
  current: JSONContent,
): JSONContent =>
  previous
    ? { ...current, content: diffBlocks(previous.content, current.content) }
    : current;
