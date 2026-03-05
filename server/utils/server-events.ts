import { desc, eq, sql } from "drizzle-orm";

export const checkForChanges = async (
  userId: string,
  previousId: string,
): Promise<
  { changed: true; newId: string } | { changed: false; newId: null }
> => {
  const db = useDrizzle();
  const changes = await db
    .select()
    .from(tables.changelog)
    .where(eq(tables.changelog.userId, userId))
    .orderBy(desc(sql`rowid`))
    .limit(1);
  if (!changes.length) {
    return { changed: false, newId: null };
  }
  const [lastChange] = changes;
  if (!lastChange) {
    return { changed: false, newId: null };
  }
  if (lastChange.id !== previousId) {
    return { changed: true, newId: lastChange.id };
  }
  return { changed: false, newId: null };
};
