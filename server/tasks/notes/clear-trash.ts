export default defineTask({
  meta: {
    name: "notes:clear-trash",
    description: "Deletes all trashed notes after 7 days",
  },
  async run() {
    // TODO: Check if the note is older than 7 days
    const db = useDrizzle();

    const result = await db
      .delete(tables.note)
      .where(and(eq(tables.note.trashed, true)))
      .returning({ id: tables.note.id });
    console.log(`Deleted ${result.length} trashed notes`);
    return { result: "Completed" };
  },
});
