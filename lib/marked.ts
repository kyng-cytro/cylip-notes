import { marked } from "marked";

const looksLikeBlocks = (markdown: string) =>
  /(\n|^-|\d+\. )/m.test(markdown.trim());

export const markdownToHTML = (markdown: string) =>
  looksLikeBlocks(markdown)
    ? marked.parse(markdown)
    : marked.parseInline(markdown);
