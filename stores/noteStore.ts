import type { Label, Note } from "@/server/utils/drizzle";
import type { SerializeObject } from "nitropack";
export const useNoteStore = defineStore("notes", () => {
  const notes = ref<SerializeObject<Note>[]>([]);
  const labels = ref<SerializeObject<Label>[]>([]);

  const loadData = async (id: string) => {
    return await $fetch(`/api/users/${id}`);
  };

  const initStore = async () => {
    const { user } = useUser();
    if (!user.value) return;
    const data = await loadData(user.value.id);
    if (!data) return;
    notes.value = data.notes;
    labels.value = data.labels;
  };

  const createLabel = async (values: Record<string, any>) => {
    const label = await $fetch("/api/labels", {
      method: "POST",
      body: values,
    });
    labels.value = [label, ...labels.value];
  };

  return {
    notes,
    labels,
    initStore,
    createLabel,
  };
});
