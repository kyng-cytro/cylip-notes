import TurndownService from "turndown";

const turndown = new TurndownService({ bulletListMarker: "-" })
  .addRule("strong", {
    filter: ["strong", "b"],
    replacement: (content) => `*${content}*`,
  })
  .addRule("link", {
    filter: "a",
    replacement: (_, node) => (node as HTMLAnchorElement).href,
  });

const unwrapListParagraphs = (html: string) =>
  html.replaceAll(/<li><p>(.*?)<\/p><(\/?)(ol|li|ul)>/gi, "<li>$1<$2$3>");

export const htmlToMarkdown = (html: string) =>
  turndown.turndown(unwrapListParagraphs(html));
