export const checkForChanges = async (
  userId: string,
  previousId: string,
): Promise<
  { chanaged: true; newId: string } | { chanaged: false; newId: null }
> => {
  const db = useDrizzle();
  const changes = await db
    .select()
    .from(tables.changelog)
    .where(eq(tables.changelog.userId, userId));
  if (!changes.length) {
    return { chanaged: false, newId: null };
  }
  const lastChange = changes[0];
  if (!lastChange) {
    return { chanaged: false, newId: null };
  }
  if (lastChange.id !== previousId) {
    return { chanaged: true, newId: lastChange.id };
  }
  return { chanaged: false, newId: null };
};
