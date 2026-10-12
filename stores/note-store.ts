import {
  ALL_NOTES,
  LIMITS,
  NOTE_PASSKEY,
  SHARED_WITH_ME,
  SYNC_TIMING,
} from "@/constants";
import { createId } from "@/lib/id";
import {
  scopeFilters,
  sortKeyIn,
  toggleMessages,
  type ToggleProp,
} from "@/lib/notes";
import { SyncEngine } from "@/lib/sync/engine";
import { byKey, keyBefore, keyBetween } from "@/lib/sync/ordering";
import {
  canEdit,
  type Background,
  type LabelOptions,
  type NoteMeta,
  type WorkspaceNote,
} from "@/lib/sync/protocol";
import { NotePasskeys } from "@/lib/sync/note-passkeys";
import { lockedNoteView } from "@/lib/sync/note-views";
import { createSearchIndex } from "@/lib/sync/search";
import type { ClientLabel, ClientNote, NoteScope } from "@/lib/types";
import { toast } from "vue-sonner";

type LabelValues = { name: string; options: LabelOptions };

const labelScope = (filter?: string | null) =>
  filter && filter !== ALL_NOTES && filter !== SHARED_WITH_ME ? filter : null;

const inFilter = (note: ClientNote, filter?: string) => {
  if (filter === SHARED_WITH_ME) return note.role !== "owner";
  const labelId = labelScope(filter);
  return !labelId || note.labelId === labelId;
};

const uploadImage = async (file: Blob) => {
  const body = new FormData();
  body.append("file", file);
  const { url } = await $fetch("/api/images", {
    method: "POST",
    body,
    timeout: SYNC_TIMING.imageUploadTimeout,
  });
  return url;
};

export const useNoteStore = defineStore("notes", () => {
  const { user, preferences, getToken, updatePreferences } = useUser();
  const { refresh: refreshInvites } = useInvites();
  const engine = shallowRef<SyncEngine | null>(null);
  const passkeys = shallowRef<NotePasskeys | null>(null);
  const passkeyFailedIds = shallowRef<string[]>([]);
  const starting = shallowRef<Promise<void> | null>(null);

  const initialized = computed(() => engine.value?.ready.value ?? false);
  const caughtUp = computed(() => engine.value?.caughtUp.value ?? false);
  const status = computed(() => engine.value?.status.value ?? "offline");
  const blockedNotes = computed(() => engine.value?.blocked.value ?? []);
  const passkeySupported = computed(
    () => passkeys.value?.supported.value ?? false,
  );
  const passkeyRegistered = computed(
    () => preferences.value.notePasskeyIds.length > 0,
  );

  const labels = computed<ClientLabel[]>(() =>
    Object.entries(engine.value?.workspace.value.labels ?? {})
      .map(([id, label]) => ({ id, ...label }))
      .sort(byKey((label) => label.sortKey)),
  );

  const notes = computed<ClientNote[]>(() => {
    const entries = engine.value?.workspace.value.notes ?? {};
    const views = engine.value?.views.value ?? {};
    const labelsById = new Map(labels.value.map((label) => [label.id, label]));
    const viewOf = (id: string, entry: WorkspaceNote) =>
      views[id] ?? (entry.meta ? lockedNoteView(id, entry.meta) : undefined);
    return Object.entries(entries)
      .map(([id, entry]) => ({ id, entry, view: viewOf(id, entry) }))
      .filter(({ view }) => view?.loaded)
      .map(({ id, entry, view }) => ({
        ...view!,
        ...entry,
        label: (entry.labelId && labelsById.get(entry.labelId)) || null,
        locked: !engine.value!.canOpen(id),
      }))
      .filter((note) => !note.trashed || note.role === "owner");
  });

  const requireEngine = () => {
    if (!engine.value) throw new Error("Notes are still loading.");
    return engine.value;
  };

  const workspace = () => requireEngine().workspaceDoc;

  const updateEntry = (noteId: string, values: Partial<WorkspaceNote>) =>
    workspace().updateNote(noteId, values);

  const updateMeta = (noteId: string, values: Partial<NoteMeta>) =>
    requireEngine().updateNoteMeta(noteId, values);

  const firstSortKey = (labelId: string | null) =>
    notes.value
      .filter((note) => !labelId || note.labelId === labelId)
      .map((note) => sortKeyIn(note, labelId))
      .filter(Boolean)
      .sort()[0];

  const lockedAtOf = (noteId: string) =>
    engine.value?.workspace.value.notes[noteId]?.lockedAt;

  const startPasskeys = async () => {
    const created = markRaw(
      new NotePasskeys({
        account: {
          id: user.value!.id,
          email: user.value!.email,
          name: user.value!.name,
        },
        knownCredentialIds: () => preferences.value.notePasskeyIds,
        saveCredentialId: (credentialId) =>
          updatePreferences({
            notePasskeyIds: [
              ...preferences.value.notePasskeyIds,
              credentialId,
            ].slice(-NOTE_PASSKEY.maxKnownCredentials),
          }),
      }),
    );
    await created.load(lockedAtOf);
    passkeys.value = created;
  };

  const startEngine = async (userId: string) => {
    const created = markRaw(
      new SyncEngine({
        userId,
        syncUrl: useRuntimeConfig().public.syncUrl,
        getToken,
        uploadImage,
        onInvitesChanged: refreshInvites,
      }),
    );
    await created.start();
    engine.value = created;
    await startPasskeys();
  };

  const ensureStarted = () => {
    if (!user.value) return Promise.resolve();
    starting.value ??= startEngine(user.value.id);
    return starting.value;
  };

  const resetStore = async () => {
    await engine.value?.stop({ clearData: true });
    await passkeys.value?.clear();
    engine.value = null;
    passkeys.value = null;
    starting.value = null;
  };

  const retrieveNotes = (scope: NoteScope, filter?: string) => {
    const inLabel = labelScope(filter);
    return notes.value
      .filter((note) => scopeFilters[scope](note))
      .filter((note) => inFilter(note, filter))
      .sort(byKey((note) => sortKeyIn(note, inLabel) ?? null));
  };

  const getNoteById = (noteId: string) =>
    notes.value.find((note) => note.id === noteId);

  const loadNoteDoc = (noteId: string) => requireEngine().loadNoteDoc(noteId);

  const createNote = (labelId?: string) => {
    const label = labels.value.find((item) => item.id === labelId);
    const noteId = createId();
    const now = Date.now();
    updateMeta(noteId, {
      title: "",
      background: label?.options.background ?? null,
      public: false,
      trashed: false,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      ownerId: user.value!.id,
    });
    workspace().addNote(noteId, {
      role: "owner",
      pinned: false,
      archived: false,
      labelId: label?.id ?? null,
      sortKey: keyBefore(firstSortKey(null)),
      labelSortKey: label ? keyBefore(firstSortKey(label.id)) : null,
      reminderAt: null,
      preview: label?.options.preview ?? true,
      addedAt: now,
    });
    return noteId;
  };

  const updateTitle = (noteId: string, title: string) =>
    updateMeta(noteId, { title });

  const assignLabel = (note: ClientNote, labelId: string | null) => {
    if (labelId === note.labelId) return;
    const label = labels.value.find((item) => item.id === labelId);
    const applyDefaults = label && preferences.value.applyLabelDefaults;
    updateEntry(note.id, {
      labelId,
      labelSortKey: labelId ? keyBefore(firstSortKey(labelId)) : null,
      ...(applyDefaults && { preview: label.options.preview }),
    });
    if (applyDefaults && canEdit(note.role))
      updateMeta(note.id, { background: label.options.background ?? null });
    toast.success("Label updated successfully.");
  };

  const setBackground = (note: ClientNote, background: Background) => {
    updateMeta(note.id, { background });
    toast.success("Background updated successfully.");
  };

  const setReminder = (noteId: string, reminderAt: Date | null) => {
    updateEntry(noteId, { reminderAt: reminderAt?.getTime() ?? null });
    toast.success(reminderAt ? "Reminder set." : "Reminder cleared.");
  };

  const toggles: Record<ToggleProp, (note: ClientNote) => void> = {
    pinned: (note) =>
      updateEntry(note.id, { pinned: !note.pinned, archived: false }),
    archived: (note) =>
      updateEntry(note.id, { archived: !note.archived, pinned: false }),
    preview: (note) => updateEntry(note.id, { preview: !note.preview }),
    public: (note) => updateMeta(note.id, { public: !note.public }),
    trashed: (note) => {
      updateMeta(note.id, {
        trashed: !note.trashed,
        trashedAt: note.trashed ? null : Date.now(),
        public: false,
      });
      updateEntry(note.id, { pinned: false, archived: false });
    },
  };

  const toggleNoteProp = (
    note: ClientNote,
    prop: ToggleProp,
    options = { silent: false },
  ) => {
    const message = toggleMessages[prop](note);
    toggles[prop](note);
    if (options.silent) return;
    toast.success(`Note ${message}.`, {
      action: {
        label: "Undo",
        onClick: () =>
          toggleNoteProp(getNoteById(note.id)!, prop, { silent: true }),
      },
    });
  };

  const moveNote = (
    noteId: string,
    labelId: string | undefined,
    beforeId: string | null,
    afterId: string | null,
  ) => {
    const inLabel = labelScope(labelId);
    const keyOf = (id: string | null) =>
      id ? sortKeyIn(getNoteById(id), inLabel) : null;
    const key = keyBetween(keyOf(beforeId), keyOf(afterId));
    updateEntry(noteId, inLabel ? { labelSortKey: key } : { sortKey: key });
  };

  const requireUniqueSlug = (slug: string, exceptId?: string) => {
    if (
      labels.value.some((label) => label.slug === slug && label.id !== exceptId)
    ) {
      throw new Error("A label with that name already exists.");
    }
  };

  const requireLabelAllowance = () => {
    if (
      !useUser().isPremium.value &&
      labels.value.length >= LIMITS.maxFreeLabels
    ) {
      throw new Error(
        `Free accounts can have up to ${LIMITS.maxFreeLabels} labels.`,
      );
    }
  };

  const createLabel = (values: LabelValues) => {
    const slug = slugify(values.name);
    requireUniqueSlug(slug);
    requireLabelAllowance();
    workspace().addLabel(createId(), {
      ...values,
      slug,
      sortKey: keyBefore(labels.value[0]?.sortKey),
      createdAt: Date.now(),
    });
  };

  const updateLabel = (labelId: string, values: LabelValues) => {
    const slug = slugify(values.name);
    requireUniqueSlug(slug, labelId);
    workspace().updateLabel(labelId, { ...values, slug });
  };

  const deleteLabel = (labelId: string) => {
    workspace().removeLabel(labelId);
    const layoutStore = useLayoutStore();
    if (layoutStore.label === labelId) layoutStore.showAllNotes();
  };

  const moveLabel = (
    labelId: string,
    beforeId: string | null,
    afterId: string | null,
  ) => {
    const keyOf = (id: string | null) =>
      labels.value.find((label) => label.id === id)?.sortKey;
    workspace().updateLabel(labelId, {
      sortKey: keyBetween(keyOf(beforeId), keyOf(afterId)),
    });
  };

  const unlockWithPassword = async (noteId: string, password: string) => {
    if (!navigator.onLine) {
      await requireEngine().unlockOffline(noteId, password);
    } else {
      const unlock = await $fetch(`/api/notes/${noteId}/unlock`, {
        method: "POST",
        body: { password },
      });
      await requireEngine().unlockOnline(noteId, password, unlock);
    }
    setPasskeyFailed(noteId, false);
  };

  const setPasskeyFailed = (noteId: string, failed: boolean) => {
    const others = passkeyFailedIds.value.filter((id) => id !== noteId);
    passkeyFailedIds.value = failed ? [...others, noteId] : others;
  };

  const passkeyFailed = (noteId: string) =>
    passkeyFailedIds.value.includes(noteId);

  const hasSavedPassword = (noteId: string) =>
    !!passkeys.value?.has(noteId, lockedAtOf(noteId));

  const readyPasskey = async () => {
    try {
      await passkeys.value!.setUp();
      return true;
    } catch (e: any) {
      toast.error("Couldn't use your passkey.", { description: e.message });
      return false;
    }
  };

  const unlockNote = async (
    noteId: string,
    password: string,
    options = { remember: false },
  ) => {
    const remember = options.remember && (await readyPasskey());
    await unlockWithPassword(noteId, password);
    if (remember) {
      await passkeys.value!.remember(noteId, lockedAtOf(noteId)!, password);
    }
  };

  const unlockWithPasskey = async (noteIds: string[]) => {
    const savedIds = noteIds.filter(hasSavedPassword);
    const passwords = await passkeys.value!.recall(savedIds);
    await Promise.all(
      [...passwords].map(([noteId, password]) =>
        unlockWithPassword(noteId, password).catch((e) => {
          if (e.statusCode === 403) passkeys.value!.forget(noteId);
          throw e;
        }),
      ),
    );
    if (passwords.size < savedIds.length) {
      throw new Error("Some saved passwords no longer work. Enter them again.");
    }
  };

  const tryPasskeyUnlock = async (noteId: string) => {
    if (!getNoteById(noteId)?.locked || !hasSavedPassword(noteId)) return false;
    try {
      await unlockWithPasskey([noteId]);
      return true;
    } catch {
      setPasskeyFailed(noteId, true);
      return false;
    }
  };

  const forgetSavedPassword = async (noteId: string) => {
    await passkeys.value?.forget(noteId);
    setPasskeyFailed(noteId, false);
  };

  const openNote = async (noteId: string) => {
    await tryPasskeyUnlock(noteId);
    useModalRouter().push(`/app/notes/${noteId}`);
  };

  const discardLocalChanges = (noteId: string) =>
    requireEngine().discardLocalChanges(noteId);

  const lockNote = async (noteId: string, password: string) => {
    const note = getNoteById(noteId);
    if (note?.role !== "owner") {
      throw new Error("Only the owner can change the password.");
    }
    const wasLocked = !!note.lockedAt;
    const remember = hasSavedPassword(noteId) && (await readyPasskey());
    await requireEngine().syncNow();
    const unlock = await $fetch(`/api/notes/${noteId}/lock`, {
      method: "PUT",
      body: { password },
    });
    await requireEngine().unlockOnline(noteId, password, unlock);
    if (remember) {
      await passkeys.value!.remember(noteId, unlock.lockedAt, password);
    }
    toast.success(wasLocked ? "Password changed." : "Note locked.");
  };

  const removeNoteLock = async (noteId: string) => {
    try {
      await $fetch(`/api/notes/${noteId}/lock`, { method: "DELETE" });
      toast.success("Lock removed.");
    } catch {
      toast.error("Couldn't remove the lock.");
    }
  };

  const unlockToken = (noteId: string) =>
    engine.value?.unlockToken(noteId) ?? "";

  const deleteNoteForever = async (note: ClientNote) => {
    try {
      await $fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      workspace().removeNote(note.id);
      toast.success(
        note.role === "owner"
          ? "Note deleted permanently."
          : "You left the note.",
      );
    } catch {
      toast.error("Couldn't delete the note.", {
        description: "Deleting notes forever needs an internet connection.",
      });
    }
  };

  const clearTrash = async () => {
    try {
      await requireEngine().syncNow();
      await $fetch("/api/notes/trash", { method: "DELETE" });
      for (const note of retrieveNotes("trashed"))
        workspace().removeNote(note.id);
      toast.success("Trash cleared successfully.");
    } catch {
      toast.error("Couldn't clear the trash.", {
        description: "Clearing the trash needs an internet connection.",
      });
    }
  };

  const searchIndex = computed(() => createSearchIndex(notes.value));

  const search = (query: string) => searchIndex.value(query);

  const syncNow = () => engine.value?.syncNow();

  return {
    initialized,
    caughtUp,
    status,
    blockedNotes,
    passkeySupported,
    passkeyRegistered,
    notes,
    labels,
    ensureStarted,
    resetStore,
    retrieveNotes,
    getNoteById,
    loadNoteDoc,
    createNote,
    updateTitle,
    assignLabel,
    setBackground,
    setReminder,
    toggleNoteProp,
    moveNote,
    createLabel,
    updateLabel,
    deleteLabel,
    moveLabel,
    unlockNote,
    hasSavedPassword,
    unlockWithPasskey,
    tryPasskeyUnlock,
    forgetSavedPassword,
    passkeyFailed,
    openNote,
    discardLocalChanges,
    lockNote,
    removeNoteLock,
    unlockToken,
    deleteNoteForever,
    clearTrash,
    search,
    syncNow,
  };
});
