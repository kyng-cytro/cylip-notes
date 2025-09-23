import { marked } from "marked";

// TODO: this needs to be improved
export const convertToEditorJSON = (markdown: string) => {
  const isBlocky = /(\n|^-|\d+\. )/m.test(markdown.trim());
  const html = isBlocky ? marked.parse(markdown) : marked.parseInline(markdown);
  return html;
};
