export const useLayoutStore = defineStore(
  "layout",
  () => {
    const layout = ref<"grid" | "list">("grid");
    const group = ref<string>("all-notes");
    const toggleLayout = () => {
      layout.value = layout.value === "grid" ? "list" : "grid";
    };
    return {
      group,
      layout,
      toggleLayout,
    };
  },
  {
    persist: true,
  },
);
