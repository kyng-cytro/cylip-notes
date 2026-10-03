import { SyncEngine } from "@/lib/sync/engine";
import { byKey, keyBefore, keyBetween } from "@/lib/sync/ordering";
import {
  getMeta,
  writeMap,
  type Background,
  type LabelOptions,
  type NoteMeta,
  type WorkspaceNote,
} from "@/lib/sync/protocol";
import { searchNotes } from "@/lib/sync/search";
import type { ClientLabel, ClientNote, NoteScope } from "@/lib/types";
import { toast } from "vue-sonner";

const ALL_NOTES = "all-notes";

type ToggleProp = "pinned" | "archived" | "trashed" | "preview" | "public";

const scopeFilters: Record<NoteScope, (note: ClientNote) => boolean> = {
  active: (note) => !note.trashed && !note.archived && !note.pinned,
  pinned: (note) => !note.trashed && !note.archived && note.pinned,
  trashed: (note) => note.trashed,
  archived: (note) => note.archived && !note.trashed,
  reminders: (note) => !!note.reminderAt && !note.trashed,
};

const toggleMessages: Record<ToggleProp, (note: ClientNote) => string> = {
  pinned: (note) => (note.pinned ? "unpinned" : "pinned"),
  archived: (note) => (note.archived ? "unarchived" : "archived"),
  trashed: (note) => (note.trashed ? "restored" : "trashed"),
  preview: (note) => (note.preview ? "preview disabled" : "preview enabled"),
  public: (note) => (note.public ? "is now private" : "is now public"),
};

const labelScope = (labelId?: string | null) =>
  labelId && labelId !== ALL_NOTES ? labelId : null;

export const useNoteStore = defineStore("notes", () => {
  const { user, getToken } = useUser();
  const engine = shallowRef<SyncEngine | null>(null);
  const starting = shallowRef<Promise<void> | null>(null);

  const initialized = computed(() => engine.value?.ready.value ?? false);
  const status = computed(() => engine.value?.status.value ?? "offline");

  const labels = computed<ClientLabel[]>(() =>
    Object.entries(engine.value?.workspace.value.labels ?? {})
      .map(([id, label]) => ({ id, ...label }))
      .sort(byKey((label) => label.sortKey)),
  );

  const notes = computed<ClientNote[]>(() => {
    const workspace = engine.value?.workspace.value.notes ?? {};
    const views = engine.value?.views.value ?? {};
    const labelsById = new Map(labels.value.map((label) => [label.id, label]));
    return Object.entries(workspace)
      .filter(([id]) => views[id])
      .map(([id, entry]) => ({
        ...views[id]!,
        ...entry,
        label: (entry.labelId && labelsById.get(entry.labelId)) || null,
      }))
      .filter((note) => !note.trashed || note.role === "owner");
  });

  const requireEngine = () => {
    if (!engine.value) throw new Error("Notes are still loading.");
    return engine.value;
  };

  const updateEntry = (noteId: string, values: Partial<WorkspaceNote>) =>
    requireEngine().workspaceDoc.updateNote(noteId, values);

  const updateMeta = (noteId: string, values: Partial<NoteMeta>) =>
    writeMap(getMeta(requireEngine().docs.get(noteId)), values);

  const sortKeyOf = (note: ClientNote | undefined, labelId: string | null) =>
    labelId ? note?.labelSortKey : note?.sortKey;

  const firstSortKey = (labelId: string | null) =>
    notes.value
      .filter((note) => !labelId || note.labelId === labelId)
      .map((note) => sortKeyOf(note, labelId))
      .filter(Boolean)
      .sort()[0];

  const uploadImage = async (file: Blob) => {
    const body = new FormData();
    body.append("file", file);
    const { url } = await $fetch("/api/images", {
      timeout: 30_000,
      method: "POST",
      body,
    });
    return url;
  };

  const start = async (userId: string) => {
    const created = markRaw(
      new SyncEngine({
        userId,
        syncUrl: useRuntimeConfig().public.syncUrl,
        getToken,
        uploadImage,
      }),
    );
    await created.start();
    engine.value = created;
  };

  const ensureStarted = () => {
    if (!user.value) return Promise.resolve();
    starting.value ??= start(user.value.id);
    return starting.value;
  };

  const resetStore = async () => {
    await engine.value?.stop({ clearData: true });
    engine.value = null;
    starting.value = null;
  };

  const retrieveNotes = (scope: NoteScope, labelId?: string) => {
    const inLabel = labelScope(labelId);
    return notes.value
      .filter((note) => scopeFilters[scope](note))
      .filter((note) => !inLabel || note.labelId === inLabel)
      .sort(byKey((note) => sortKeyOf(note, inLabel) ?? null));
  };

  const getNoteById = (noteId: string) =>
    notes.value.find((note) => note.id === noteId);

  const loadNoteDoc = (noteId: string) => requireEngine().docs.load(noteId);

  const createNote = (labelId?: string) => {
    const label = labels.value.find((item) => item.id === labelId);
    const noteId = crypto.randomUUID();
    const now = Date.now();
    const { docs, workspaceDoc } = requireEngine();
    writeMap(getMeta(docs.get(noteId)), {
      title: "",
      background: label?.options.background ?? null,
      public: false,
      trashed: false,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      ownerId: user.value!.id,
    } satisfies NoteMeta);
    workspaceDoc.addNote(noteId, {
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
    useModalRouter().push(`/app/notes/${noteId}`);
  };

  const updateTitle = (noteId: string, title: string) =>
    updateMeta(noteId, { title });

  const assignLabel = (note: ClientNote, labelId: string | null) => {
    if (labelId === note.labelId) return;
    updateEntry(note.id, {
      labelId,
      labelSortKey: labelId ? keyBefore(firstSortKey(labelId)) : null,
    });
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
    options: { silent?: boolean } = {},
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
    const before = beforeId ? sortKeyOf(getNoteById(beforeId), inLabel) : null;
    const after = afterId ? sortKeyOf(getNoteById(afterId), inLabel) : null;
    const key = keyBetween(before, after);
    updateEntry(noteId, inLabel ? { labelSortKey: key } : { sortKey: key });
  };

  const requireUniqueSlug = (slug: string, exceptId?: string) => {
    if (
      labels.value.some((label) => label.slug === slug && label.id !== exceptId)
    ) {
      throw new Error("A label with that name already exists.");
    }
  };

  const createLabel = (values: { name: string; options: LabelOptions }) => {
    const slug = slugify(values.name);
    requireUniqueSlug(slug);
    if (
      !useUser().isPremium &&
      labels.value.length >= CONSTANTS.maxFreeLables
    ) {
      throw new Error(
        `Free accounts can have up to ${CONSTANTS.maxFreeLables} labels.`,
      );
    }
    requireEngine().workspaceDoc.addLabel(crypto.randomUUID(), {
      name: values.name,
      slug,
      sortKey: keyBefore(labels.value[0]?.sortKey),
      options: values.options,
      createdAt: Date.now(),
    });
  };

  const updateLabel = (
    labelId: string,
    values: { name: string; options: LabelOptions },
  ) => {
    const slug = slugify(values.name);
    requireUniqueSlug(slug, labelId);
    requireEngine().workspaceDoc.updateLabel(labelId, { ...values, slug });
  };

  const deleteLabel = (labelId: string) => {
    requireEngine().workspaceDoc.removeLabel(labelId);
    const layoutStore = useLayoutStore();
    if (layoutStore.label === labelId) layoutStore.label = ALL_NOTES;
  };

  const moveLabel = (
    labelId: string,
    beforeId: string | null,
    afterId: string | null,
  ) => {
    const keyOf = (id: string | null) =>
      labels.value.find((label) => label.id === id)?.sortKey;
    requireEngine().workspaceDoc.updateLabel(labelId, {
      sortKey: keyBetween(keyOf(beforeId), keyOf(afterId)),
    });
  };

  const deleteNoteForever = async (note: ClientNote) => {
    try {
      await $fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      requireEngine().workspaceDoc.removeNote(note.id);
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
      for (const note of retrieveNotes("trashed")) {
        requireEngine().workspaceDoc.removeNote(note.id);
      }
      toast.success("Trash cleared successfully.");
    } catch {
      toast.error("Couldn't clear the trash.", {
        description: "Clearing the trash needs an internet connection.",
      });
    }
  };

  const search = (query: string) => searchNotes(notes.value, query);

  const syncNow = () => engine.value?.syncNow();

  return {
    initialized,
    status,
    notes,
    labels,
    ensureStarted,
    resetStore,
    methods: {
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
      deleteNoteForever,
      clearTrash,
      search,
      syncNow,
    },
  };
});
