import { ALL_NOTES } from "@/constants";
export const useLayoutStore = defineStore(
  "layout",
  () => {
    const layout = ref<"grid" | "list">("grid");
    const label = ref(ALL_NOTES);
    const toggleLayout = () => {
      layout.value = layout.value === "grid" ? "list" : "grid";
    };
    const showAllNotes = () => {
      label.value = ALL_NOTES;
    };
    return { label, layout, toggleLayout, showAllNotes };
  },
  { persist: true },
);
