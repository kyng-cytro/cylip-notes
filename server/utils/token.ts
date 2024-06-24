import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";

export const generateVerificationToken = async (userId: string) => {
  const db = useDrizzle();
  try {
    // Delete any existing tokens for this user
    await db
      .delete(tables.emailVerificationTokenTable)
      .where(eq(tables.emailVerificationTokenTable.userId, userId));
    const id = generateRandomString(64, alphabet("0-9"));
    await db.insert(tables.emailVerificationTokenTable).values({
      id,
      userId,
      expiresAt: createDate(new TimeSpan(2, "h")).getMilliseconds(),
    });
    return id;
  } catch (e) {
    console.error({ e });
  }
};

export const validateVerificationToken = async (token: string) => {
  const db = useDrizzle();
  try {
    const storedTokens = await db
      .select()
      .from(tables.emailVerificationTokenTable)
      .where(eq(tables.emailVerificationTokenTable.id, token));
    if (!storedTokens.length || !storedTokens[0]) return null;
    const storedToken = storedTokens[0];
    if (!isWithinExpirationDate(new Date(storedToken.expiresAt))) {
      return null;
    }
    // Delete all tokens for this user
    await db
      .delete(tables.emailVerificationTokenTable)
      .where(eq(tables.emailVerificationTokenTable.userId, storedToken.userId));
    return storedToken.userId;
  } catch (e) {
    console.error({ e });
    return null;
  }
};
