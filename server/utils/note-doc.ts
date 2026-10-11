import { DOC_KEYS } from "@/constants";
import { extensions } from "@/lib/tiptap";
import {
  getMeta,
  readMeta,
  toBase64,
  writeMap,
  type NoteMeta,
} from "@/lib/sync/protocol";
import { getSchema, type JSONContent } from "@tiptap/core";
import {
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProseMirrorRootNode,
} from "@tiptap/y-tiptap";
import * as Y from "yjs";

const schema = getSchema(extensions);

type NoteRow = typeof tables.note.$inferSelect;

export const toNoteMeta = (note: NoteRow): NoteMeta => ({
  title: note.title ?? "",
  background: note.options?.background ?? null,
  public: note.options?.public?.enabled ?? false,
  trashed: note.trashed,
  trashedAt: note.trashedAt?.getTime() ?? null,
  createdAt: note.createdAt.getTime(),
  updatedAt: note.updatedAt.getTime(),
  ownerId: note.userId,
});

export const buildNoteDoc = (content: JSONContent | null, meta: NoteMeta) => {
  const doc = new Y.Doc();
  doc.transact(() => {
    writeMap(getMeta(doc), meta);
    if (content) {
      prosemirrorJSONToYXmlFragment(
        schema,
        content,
        doc.getXmlFragment(DOC_KEYS.content),
      );
    }
  });
  return doc;
};

export const encodeNoteDoc = (doc: Y.Doc) =>
  toBase64(Y.encodeStateAsUpdate(doc));

export const readNoteDoc = (doc: Y.Doc) => ({
  meta: readMeta(doc),
  content: yXmlFragmentToProseMirrorRootNode(
    doc.getXmlFragment(DOC_KEYS.content),
    schema,
  ).toJSON() as JSONContent,
});
