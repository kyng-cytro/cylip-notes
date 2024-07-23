import type { Label, Note } from "@/server/utils/drizzle";
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

  // Notes that are not trashed or archived
  const activeNotes = computed(() => {
    return notes.value.filter((note) => !note.trashed && !note.archived);
  });

  const normalNotes = computed(() => {
    return activeNotes.value.filter((note) => !note.pinned);
  });

  const pinnedNotes = computed(() => {
    return activeNotes.value.filter((note) => note.pinned);
  });

  const trashedNotes = computed(() => {
    return notes.value.filter((note) => note.trashed);
  });

  const archivedNotes = computed(() => {
    return notes.value.filter((note) => note.archived);
  });

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

  const createNote = async () => {
    try {
      const note = await $fetch("/api/notes", { method: "POST" });
      notes.value = [note, ...notes.value];
      useModalRouter().push(`/app/notes/${note.id}`);
    } catch (e: any) {
      toast.error({
        title: "Error creating note",
        description: e.message,
      });
    }
  };

  const toggleNoteProp = async (
    note: Note,
    prop: "pinned" | "archived" | "trashed",
  ) => {
    const data = await $fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      body: { field: prop, value: !note[prop] },
    });
    notes.value = notes.value.map((n) => (n.id === note.id ? data : n));
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
    pinnedNotes,
    normalNotes,
    trashedNotes,
    archivedNotes,
    methods: {
      createNote,
      createLabel,
      getNoteById,
      refreshData,
      toggleNoteProp,
    },
    initStore,
  };
});
