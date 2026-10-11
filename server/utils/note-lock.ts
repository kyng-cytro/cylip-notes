import { NOTE_LOCK } from "@/constants";
import type { NoteLockState } from "@/lib/sync/protocol";
import {
  hashPassword,
  signJWT,
  verifyJWT,
  verifyPassword,
} from "better-auth/crypto";

type UnlockClaims = { noteId: string; userId: string; lockedAt: number };

const tokenSecret = () => useRuntimeConfig().auth.secret;

export const getNoteLock = (noteId: string) =>
  useDrizzle().query.noteLock.findFirst({
    where: eq(tables.noteLock.noteId, noteId),
  });

export const getNoteLocks = async (noteIds: string[]) => {
  if (!noteIds.length) return new Map<string, number>();
  const locks = await useDrizzle().query.noteLock.findMany({
    columns: { noteId: true, lockedAt: true },
    where: inArray(tables.noteLock.noteId, noteIds),
  });
  return new Map(locks.map((lock) => [lock.noteId, lock.lockedAt.getTime()]));
};

export const setNoteLock = async (noteId: string, password: string) => {
  const values = {
    passwordHash: await hashPassword(password),
    lockedAt: new Date(),
  };
  await useDrizzle()
    .insert(tables.noteLock)
    .values({ noteId, ...values })
    .onConflictDoUpdate({ target: tables.noteLock.noteId, set: values });
  return values.lockedAt.getTime();
};

export const removeNoteLock = (noteId: string) =>
  useDrizzle()
    .delete(tables.noteLock)
    .where(eq(tables.noteLock.noteId, noteId));

export const NO_LOCK: NoteLockState = { lockedAt: null, meta: null };

export const currentLockState = async (
  noteId: string,
): Promise<NoteLockState> => {
  const [lock, note] = await Promise.all([
    getNoteLock(noteId),
    useDrizzle().query.note.findFirst({ where: eq(tables.note.id, noteId) }),
  ]);
  if (!lock || !note) return NO_LOCK;
  return { lockedAt: lock.lockedAt.getTime(), meta: toNoteMeta(note) };
};

export const publishNoteLock = (
  noteId: string,
  userIds: string[],
  lock: NoteLockState,
) =>
  Promise.all(
    userIds.map((userId) => setWorkspaceNoteLock(userId, noteId, lock)),
  );

export const createUnlock = async (claims: UnlockClaims) => ({
  token: await signJWT(claims, tokenSecret(), NOTE_LOCK.unlockTokenTtlSeconds),
  lockedAt: claims.lockedAt,
  expiresAt: Date.now() + NOTE_LOCK.unlockTokenTtlSeconds * 1000,
});

export const isValidUnlockToken = async (
  token: string | undefined,
  claims: UnlockClaims,
) => {
  if (!token) return false;
  const payload = await verifyJWT<UnlockClaims>(token, tokenSecret());
  return (
    payload?.noteId === claims.noteId &&
    payload.userId === claims.userId &&
    payload.lockedAt === claims.lockedAt
  );
};

const findAttempt = (key: string) =>
  useDrizzle().query.unlockAttempt.findFirst({
    where: eq(tables.unlockAttempt.key, key),
  });

const recordFailedAttempt = (
  key: string,
  failures: number,
  windowStart: Date,
) =>
  useDrizzle()
    .insert(tables.unlockAttempt)
    .values({ key, failures, windowStart })
    .onConflictDoUpdate({
      target: tables.unlockAttempt.key,
      set: { failures, windowStart },
    });

const clearAttempts = (key: string) =>
  useDrizzle()
    .delete(tables.unlockAttempt)
    .where(eq(tables.unlockAttempt.key, key));

export const requireNotePassword = async (
  attemptKey: string,
  passwordHash: string,
  password: string,
) => {
  const attempt = await findAttempt(attemptKey);
  const inWindow =
    !!attempt &&
    Date.now() - attempt.windowStart.getTime() < NOTE_LOCK.attemptWindow;
  if (inWindow && attempt.failures >= NOTE_LOCK.maxFailedAttempts) {
    throw createError({
      statusCode: 429,
      message: "Too many attempts. Try again in a few minutes.",
    });
  }
  if (await verifyPassword({ hash: passwordHash, password })) {
    await clearAttempts(attemptKey);
    return;
  }
  await recordFailedAttempt(
    attemptKey,
    inWindow ? attempt.failures + 1 : 1,
    inWindow ? attempt.windowStart : new Date(),
  );
  throw createError({ statusCode: 403, message: "Incorrect password." });
};
