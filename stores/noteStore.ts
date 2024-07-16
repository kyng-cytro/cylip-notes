import type { Label, Note } from "@/server/utils/drizzle";

export const useNoteStore = defineStore("notes", () => {
  // Getters
  const { user } = useUser();
  const notes = ref<Note[]>([]);
  const labels = ref<Label[]>([]);
  const initialized = ref(false);
  const pinnedNotes = computed(() => []);
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

  const createLabel = async (values: Record<string, any>) => {
    const label = await $fetch("/api/labels", {
      method: "POST",
      body: values,
    });
    labels.value = [label, ...labels.value];
  };

  // SSE
  const { data, event } = useEventSource(
    `${baseUrl}/api/users/sse/${userId.value}`,
    ["connection", "refresh"] as const,
  );

  // Watch for changes and refresh data

  watch(data, () => {
    if (event.value === "refresh") {
      refreshData();
    }
  });

  return {
    notes,
    labels,
    fetching,
    initStore,
    createLabel,
    initialized,
    pinnedNotes,
  };
});
