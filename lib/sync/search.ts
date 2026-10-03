import MiniSearch from "minisearch";
import type { NoteView } from "./note-views";

type SearchResult = { id: string; title: string; snippet: string };

const SNIPPET_RADIUS = 60;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const snippetFor = (text: string, terms: string[]) => {
  const lower = text.toLowerCase();
  const index = Math.max(0, ...terms.map((term) => lower.indexOf(term)));
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const excerpt = escapeHtml(text.slice(start, index + SNIPPET_RADIUS * 2));
  const pattern = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return `${start > 0 ? "..." : ""}${excerpt.replace(pattern, "<mark>$1</mark>")}...`;
};

export const searchNotes = (
  notes: NoteView[],
  query: string,
): SearchResult[] => {
  const index = new MiniSearch<NoteView>({
    fields: ["title", "text"],
    storeFields: ["title", "text"],
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 } },
  });
  index.addAll(notes);
  return index
    .search(query)
    .slice(0, 10)
    .map((result) => ({
      id: result.id,
      title: result.title,
      snippet: snippetFor(result.text, result.terms),
    }));
};
