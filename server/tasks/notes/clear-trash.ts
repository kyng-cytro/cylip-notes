import { subDays } from "date-fns";

export default defineTask({
  meta: {
    name: "notes:clear-trash",
    description: "Deletes all trashed notes after 7 days",
  },
  async run() {
    const db = useDrizzle();
    const sevenDaysAgo = subDays(new Date(), 7);
    const result = await db
      .delete(tables.note)
      .where(
        and(
          eq(tables.note.trashed, true),
          lt(tables.note.trashedAt, sevenDaysAgo),
        ),
      )
      .returning({ id: tables.note.id });
    console.log(`Deleted ${result.length} trashed notes`);
    return { result: `Deleted ${result.length} trashed notes` };
  },
});
