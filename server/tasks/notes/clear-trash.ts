import { subDays } from "date-fns";

export default defineTask({
  meta: {
    name: "notes:clear-trash",
    description: "Deletes notes that have been in the trash for 7 days",
  },
  async run() {
    const expired = await useDrizzle().query.note.findMany({
      columns: { id: true },
      where: and(
        eq(tables.note.trashed, true),
        lt(tables.note.trashedAt, subDays(new Date(), 7)),
      ),
    });
    await deleteNotes(expired.map((note) => note.id));
    return { result: `Deleted ${expired.length} trashed notes` };
  },
});
