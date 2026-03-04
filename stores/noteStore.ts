import type { Label, Note } from "@/server/utils/drizzle";
import type { JSONContent } from "@tiptap/vue-3";
import { toast } from "vue-sonner";

export const useNoteStore = defineStore("notes", () => {
  // Getters
  const { user } = useUser();
  const notes = ref<Note[]>([]);
  const labels = ref<Label[]>([]);
  const initialized = ref(false);
  const fetching = ref(false);
  const { baseUrl } = useRuntimeConfig().public;
  const userId = computed(() => user.value?.id);

  // Init
  const initStore = async () => {
    if (!userId.value) return;
    const data = await loadData(userId.value);
    if (data) updateData(data);
    initialized.value = true;
  };

  // Actions
  const loadData = async (id: string) => {
    fetching.value = true;
    const data = await $fetch(`/api/users/${id}`);
    fetching.value = false;
    return data;
  };

  const updateData = (data: { notes: Note[]; labels: Label[] }) => {
    notes.value = data.notes;
    labels.value = data.labels;
  };

  const refreshData = async () => {
    if (!userId.value) return;
    const data = await loadData(userId.value);
    if (data) updateData(data);
  };

  const retrieveNotes = (
    status: "active" | "pinned" | "trashed" | "archived" | "reminders",
    labelId?: string,
  ) => {
    const filterConfig = getFilterConfig(status, labelId);
    const isLabelScope = !!labelId && labelId !== "all-notes";

    return notes.value
      .filter((note) => filterConfig(note))
      .sort((a, b) => {
        const primaryOrder = isLabelScope
          ? (b.labelOrder || 0) - (a.labelOrder || 0)
          : (b.globalOrder || 0) - (a.globalOrder || 0);

        if (primaryOrder !== 0) return primaryOrder;

        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  };

  const getNoteById = (id: string) => {
    return notes.value.find((note) => note.id === id);
  };

  const createLabel = async (values: Record<string, any>) => {
    const label = await $fetch("/api/labels", {
      method: "POST",
      body: values,
    });
    labels.value = [label, ...labels.value];
  };

  const createNote = async (labelId?: string) => {
    try {
      const note = await $fetch("/api/notes", {
        method: "POST",
        body: { labelId },
      });
      notes.value = [note, ...notes.value];
      useModalRouter().push(`/app/notes/${note.id}`);
    } catch (e: any) {
      toast.error("Error creating note", {
        description: e.message,
      });
    }
  };

  const updateNote = async (
    noteId: string,
    prop: "title" | "content",
    newValue: string | JSONContent,
  ) => {
    try {
      const data = await $fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        body: { field: prop, value: newValue },
      });
      notes.value = notes.value.map((n) => (n.id === noteId ? data : n));
    } catch (e: any) {
      toast.error("Something went wrong updating the note.", {
        description: e.message,
      });
    }
  };

  const assignLabel = async (note: Note, labelId: string | null) => {
    if (labelId === note.labelId) return;
    try {
      const data = await $fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        body: { field: "label", value: labelId },
      });
      notes.value = notes.value.map((n) => (n.id === note.id ? data : n));
      toast.success("Label updated successfully.");
    } catch (e: any) {
      toast.error("Something went wrong updating the note.", {
        description: e.message,
      });
    }
  };

  const setBackground = async (
    note: Note,
    options: { type: "color" | "image"; value: string } | null,
  ) => {
    try {
      const data = await $fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        body: {
          field: "options",
          value: {
            ...note.options,
            background: {
              type: options?.type || null,
              value: options?.value || null,
            },
          },
        },
      });
      notes.value = notes.value.map((n) => (n.id === note.id ? data : n));
      toast.success("Background updated successfully.");
    } catch (e: any) {
      toast.error("Something went wrong updating the note.", {
        description: e.message,
      });
    }
  };

  const setReminder = async (note: Note, reminderAt: Date | null) => {
    try {
      const data = await $fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        body: { field: "reminder_at", value: reminderAt },
      });
      notes.value = notes.value.map((n) => (n.id === note.id ? data : n));
      toast.success("Reminder updated successfully.");
    } catch (e: any) {
      toast.error("Something went wrong updating the note.", {
        description: e.message,
      });
    }
  };

  const toggleNoteProp = async (
    note: Note,
    prop: "pinned" | "archived" | "trashed" | "preview" | "public",
    options?: { recursiveCall?: boolean },
  ) => {
    const { body, message } = getToggleConfig(note, prop);
    try {
      const data = await $fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        body,
      });
      notes.value = notes.value.map((n) => (n.id === note.id ? data : n));
      if (options?.recursiveCall) return;
      toast.success(`Note ${message}.`, {
        action: {
          label: "Undo",
          onClick: () => toggleNoteProp(data, prop, { recursiveCall: true }),
        },
      });
    } catch (e: any) {
      toast.error("Something went wrong updating the note.", {
        description: e.message,
      });
    }
  };

  const permenentlyDeleteNote = async (note: Note) => {
    try {
      await $fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      notes.value = notes.value.filter((n) => n.id !== note.id);
      toast.success("Note deleted permanently.");
    } catch (e: any) {
      toast.error("Error deleting note.", { description: e.message });
    }
  };

  const clearTrash = async () => {
    try {
      await $fetch(`/api/users/${userId.value}/clear-trash`, {
        method: "DELETE",
      });
      notes.value = notes.value.filter((n) => !n.trashed);
      toast.success("Trash cleared successfully.");
    } catch (e: any) {
      toast.error("Error clearing trash.", { description: e.message });
    }
  };

  const searchNotes = async (query: string) => {
    try {
      const data = await $fetch(`/api/search/notes?q=${query}`);
      return data;
    } catch (e: any) {
      toast.error("Error searching notes.", { description: e.message });
    }
  };

  const reorderNotes = async (params: {
    scope: "all" | "label";
    labelId?: string;
    orderedIds: string[];
  }) => {
    const { scope, labelId, orderedIds } = params;
    if (orderedIds.length < 2) return;

    const rankMap = new Map(
      orderedIds.map((id, index) => [id, orderedIds.length - index]),
    );

    const previousNotes = [...notes.value];

    notes.value = notes.value.map((note) => {
      const rank = rankMap.get(note.id);
      if (!rank) return note;

      return {
        ...note,
        ...(scope === "label"
          ? { labelOrder: rank }
          : { globalOrder: rank }),
      };
    });

    try {
      await $fetch("/api/notes/reorder/list", {
        method: "PATCH",
        body: { scope, labelId, orderedIds },
      });
    } catch (e: any) {
      notes.value = previousNotes;
      toast.error("Error reordering notes.", { description: e.message });
    }
  };

  // SSE
  const { data, event } = useEventSource(
    `${baseUrl}/api/users/server-events/${userId.value}`,
    ["connection", "refresh"] as const,
  );

  // Watch for changes and refresh data
  watch(data, () => {
    if (event.value === "refresh") {
      refreshData();
    }
  });

  return {
    fetching,
    initialized,
    labels,
    methods: {
      updateNote,
      clearTrash,
      createNote,
      createLabel,
      searchNotes,
      assignLabel,
      refreshData,
      reorderNotes,
      setReminder,
      getNoteById,
      retrieveNotes,
      setBackground,
      toggleNoteProp,
      permenentlyDeleteNote,
    },
    initStore,
  };
});
