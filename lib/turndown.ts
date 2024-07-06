import TurndownService from "turndown";

/**
 * Converts HTML content to Markdown format.
 *
 * @param html - The HTML content to be converted.
 * @returns - The Markdown representation of the input HTML.
 */
export const convertToMarkDown = (html: string) => {
  // remove p tags in li
  html = html.replaceAll(
    /<li><p>(.*?)<\/p><(\/?)(ol|li|ul)>/gi,
    "<li>$1<$2$3>",
  );
  const turndownService = new TurndownService({ bulletListMarker: "-" });
  // Add a rule to convert <strong> and <b> tags to Markdown bold formatting
  turndownService.addRule("strong", {
    filter: ["strong", "b"],
    replacement: (content) => {
      return "*" + content + "*";
    },
  });
  turndownService.addRule("link", {
    filter: ["a", "a"],
    replacement: (_, node) => {
      // @ts-ignore
      return node.href;
    },
  });
  return turndownService.turndown(html);
};
