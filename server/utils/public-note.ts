export const findPublicNote = async (noteId: string) => {
  const note = await useDrizzle().query.note.findFirst({
    where: and(
      eq(tables.note.id, noteId),
      sql`json_extract(${tables.note.options}, '$.public.enabled') = true`,
    ),
  });
  if (!note) throw createError({ statusCode: 404, message: "Note not found." });
  return note;
};
