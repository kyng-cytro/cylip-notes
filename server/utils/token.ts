import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";

export const generateVerificationToken = async (userId: string) => {
  const db = useDrizzle();
  try {
    // Delete any existing tokens for this user
    await db
      .delete(tables.emailVerificationToken)
      .where(eq(tables.emailVerificationToken.userId, userId));
    const id = generateRandomString(64, alphabet("0-9"));
    await db.insert(tables.emailVerificationToken).values({
      id,
      userId,
      expiresAt: createDate(new TimeSpan(5, "m")).getTime(),
    });
    return id;
  } catch (e) {
    console.error({ e });
  }
};

export const validateVerificationToken = async (token: string) => {
  const db = useDrizzle();
  try {
    const storedToken = await db.query.emailVerificationToken.findFirst({
      where: eq(tables.emailVerificationToken.id, token),
    });
    if (!storedToken) return null;
    if (!isWithinExpirationDate(new Date(storedToken.expiresAt))) {
      return null;
    }
    // Delete all tokens for this user
    await db
      .delete(tables.emailVerificationToken)
      .where(eq(tables.emailVerificationToken.userId, storedToken.userId));
    return storedToken.userId;
  } catch (e) {
    console.error({ e });
    return null;
  }
};
