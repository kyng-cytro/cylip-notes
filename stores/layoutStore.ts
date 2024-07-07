export const useLayoutStore = defineStore(
  "layout",
  () => {
    const layout = ref<"grid" | "list">("grid");
    const label = ref<string>("all-notes");
    const toggleLayout = () => {
      layout.value = layout.value === "grid" ? "list" : "grid";
    };
    return {
      label,
      layout,
      toggleLayout,
    };
  },
  {
    persist: true,
  },
);
