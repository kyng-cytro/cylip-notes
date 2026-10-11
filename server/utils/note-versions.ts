import { HEADERS, LIMITS, NOTE_VERSIONS } from "@/constants";
import { diffVersions } from "@/lib/version-diff";
import type { JSONContent } from "@tiptap/core";
import type { H3Event } from "h3";

type Snapshot = { title: string | null; content: JSONContent };

type AccountType = keyof typeof LIMITS.versionHistory;

type StoredVersion = typeof tables.noteVersion.$inferSelect;

const isSameSnapshot = (version: StoredVersion, snapshot: Snapshot) =>
  version.title === snapshot.title &&
  JSON.stringify(version.content) === JSON.stringify(snapshot.content);

const isOpenSession = (version: StoredVersion, now: Date) =>
  !version.sealed &&
  now.getTime() - version.updatedAt.getTime() < NOTE_VERSIONS.sessionGap;

const isAvailable = (index: number, accountType: AccountType) =>
  index <= LIMITS.versionHistory[accountType];

const findVersions = (noteId: string) =>
  useDrizzle().query.noteVersion.findMany({
    where: eq(tables.noteVersion.noteId, noteId),
    orderBy: desc(tables.noteVersion.updatedAt),
  });

const updateVersion = (id: string, values: Partial<StoredVersion>) =>
  useDrizzle()
    .update(tables.noteVersion)
    .set(values)
    .where(eq(tables.noteVersion.id, id));

const deleteVersions = async (versions: StoredVersion[]) => {
  if (!versions.length) return;
  await useDrizzle()
    .delete(tables.noteVersion)
    .where(
      inArray(
        tables.noteVersion.id,
        versions.map(({ id }) => id),
      ),
    );
};

export const recordNoteVersion = async (
  noteId: string,
  snapshot: Snapshot,
  editors: string[],
  { seal = false } = {},
) => {
  const versions = await findVersions(noteId);
  const [latest] = versions;
  const now = new Date();
  const changed = !latest || !isSameSnapshot(latest, snapshot);
  if (latest && isOpenSession(latest, now)) {
    if (changed) {
      await updateVersion(latest.id, {
        ...snapshot,
        editors: [...new Set([...latest.editors, ...editors])],
        sealed: seal,
        updatedAt: now,
      });
    } else if (seal) {
      await updateVersion(latest.id, { sealed: true });
    }
    return;
  }
  if (!changed) return;
  await useDrizzle()
    .insert(tables.noteVersion)
    .values({
      id: generateId(21),
      noteId,
      ...snapshot,
      editors,
      sealed: seal,
      updatedAt: now,
    });
  const keptBesideNew = NOTE_VERSIONS.kept - 1;
  await deleteVersions(versions.slice(keptBesideNew));
};

const findEditorNames = async (userIds: string[]) => {
  const users = userIds.length
    ? await useDrizzle().query.user.findMany({
        columns: { id: true, name: true },
        where: inArray(tables.user.id, userIds),
      })
    : [];
  return new Map(users.map((user) => [user.id, user.name]));
};

export const listNoteVersions = async (
  noteId: string,
  accountType: AccountType,
) => {
  const versions = await findVersions(noteId);
  const names = await findEditorNames([
    ...new Set(versions.flatMap((version) => version.editors)),
  ]);
  return versions.map((version, index) => ({
    id: version.id,
    updatedAt: version.updatedAt.getTime(),
    current: index === 0,
    available: isAvailable(index, accountType),
    editors: version.editors
      .map((userId) => names.get(userId))
      .filter((name) => name !== undefined),
  }));
};

export const findNoteVersion = async (
  noteId: string,
  versionId: string,
  accountType: AccountType,
) => {
  const versions = await findVersions(noteId);
  const index = versions.findIndex((version) => version.id === versionId);
  const version = versions[index];
  if (!version) {
    throw createError({ statusCode: 404, message: "Version not found." });
  }
  if (!isAvailable(index, accountType)) {
    throw createError({
      statusCode: 403,
      message: "Upgrade to Pro to see older versions.",
    });
  }
  return { version, previous: versions[index + 1] };
};

export const showNoteVersion = async (
  noteId: string,
  versionId: string,
  accountType: AccountType,
) => {
  const { version, previous } = await findNoteVersion(
    noteId,
    versionId,
    accountType,
  );
  return {
    id: version.id,
    title: version.title,
    changes: diffVersions(previous?.content, version.content),
  };
};

export const requireNoteHistory = async (
  event: H3Event,
  noteId: string,
  userId: string,
) => {
  await requireNoteRole(noteId, userId, ["owner", "editor"]);
  const lock = await getNoteLock(noteId);
  if (!lock) return;
  const unlocked = await isValidUnlockToken(getHeader(event, HEADERS.unlock), {
    noteId,
    userId,
    lockedAt: lock.lockedAt.getTime(),
  });
  if (!unlocked) {
    throw createError({ statusCode: 423, message: "Unlock this note first." });
  }
};
