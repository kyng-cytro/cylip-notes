import type { JSONContent } from "@tiptap/core";

type StoredNote = { id: string; userId: string; content: JSONContent | null };

const loadNoteContent = async (note: StoredNote) => {
  if (!note.content) return null;
  const content = await extractInlineImages(note.content, note.userId);
  if (!content) return note.content;
  await useDrizzle()
    .update(tables.note)
    .set({ content })
    .where(eq(tables.note.id, note.id));
  return content;
};

export default defineSyncEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const note = await useDrizzle().query.note.findFirst({
    where: eq(tables.note.id, id),
  });
  if (!note || (note.content === null && note.title === null)) {
    throw createError({ statusCode: 404 });
  }
  const doc = buildNoteDoc(await loadNoteContent(note), toNoteMeta(note));
  return { state: encodeNoteDoc(doc) };
});
