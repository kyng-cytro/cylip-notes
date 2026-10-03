export default defineAuthenticatedEventHandler(async (event) => {
  const trashed = await useDrizzle().query.note.findMany({
    columns: { id: true },
    where: and(
      eq(tables.note.userId, event.context.user.id),
      eq(tables.note.trashed, true),
    ),
  });
  await deleteNotes(trashed.map((note) => note.id));
  return { deleted: trashed.length };
});
