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
    lableId?: string,
  ) => {
    return notes.value.filter((note) => {
      if (status === "active") {
        if (lableId && lableId !== "all-notes") {
          return (
            !note.trashed &&
            !note.archived &&
            !note.pinned &&
            note.labelId === lableId
          );
        }
        return !note.trashed && !note.archived && !note.pinned;
      }
      if (status === "pinned") {
        return !note.trashed && !note.archived && note.pinned;
      }
      if (status === "trashed") {
        return note.trashed;
      }
      if (status === "archived") {
        return note.archived;
      }
      if (status === "reminders") {
        return note.reminderAt;
      }
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
      notes.value = [...notes.value, note];
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
    prop: "pinned" | "archived" | "trashed",
    options?: { recursiveCall?: boolean },
  ) => {
    try {
      const data = await $fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        body: { field: prop, value: !note[prop] },
      });
      notes.value = notes.value.map((n) => (n.id === note.id ? data : n));
      if (options?.recursiveCall) return;
      const actionMap = {
        pinned: note[prop] ? "unpinned" : "pinned",
        archived: note[prop] ? "unarchived" : "archived",
        trashed: note[prop] ? "restored" : "trashed",
      };
      toast.success(`Note ${actionMap[prop]}.`, {
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
      createNote,
      createLabel,
      assignLabel,
      refreshData,
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
