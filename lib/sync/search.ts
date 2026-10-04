import MiniSearch from "minisearch";
import type { ClientNote } from "@/lib/types";

export type SearchResult = { note: ClientNote; snippet: string };

type IndexedNote = { id: string; title: string; text: string; label: string };

const MAX_RESULTS = 20;
const SNIPPET_RADIUS = 60;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const firstMatch = (text: string, query: string, terms: string[]) => {
  const lower = text.toLowerCase();
  const phrase = lower.indexOf(query.trim().toLowerCase());
  if (phrase >= 0) return phrase;
  const hits = terms.map((term) => lower.indexOf(term)).filter((i) => i >= 0);
  return hits.length ? Math.min(...hits) : 0;
};

const highlight = (html: string, terms: string[]) =>
  terms.length
    ? html.replace(
        new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi"),
        "<mark>$1</mark>",
      )
    : html;

const snippetFor = (text: string, query: string, terms: string[]) => {
  const index = firstMatch(text, query, terms);
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = index + SNIPPET_RADIUS * 2;
  const excerpt = highlight(escapeHtml(text.slice(start, end)), terms);
  return `${start > 0 ? "…" : ""}${excerpt}${end < text.length ? "…" : ""}`;
};

const toIndexed = (note: ClientNote): IndexedNote => ({
  id: note.id,
  title: note.title,
  text: note.text,
  label: note.label?.name ?? "",
});

export const createSearchIndex = (notes: ClientNote[]) => {
  const notesById = new Map(notes.map((note) => [note.id, note]));
  const index = new MiniSearch<IndexedNote>({
    fields: ["title", "text", "label"],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 3, label: 2 },
    },
  });
  index.addAll(notes.map(toIndexed));

  return (query: string): SearchResult[] => {
    const results = index.search(query).map((result) => {
      const note = notesById.get(result.id)!;
      const terms = [...new Set([...result.terms, ...result.queryTerms])];
      return { note, snippet: snippetFor(note.text, query, terms) };
    });
    return [
      ...results.filter(({ note }) => !note.trashed),
      ...results.filter(({ note }) => note.trashed),
    ].slice(0, MAX_RESULTS);
  };
};
