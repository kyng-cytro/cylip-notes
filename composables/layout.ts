export const useLayout = () => {
  const { layout } = storeToRefs(useLayoutStore());

  const containerParentStyles = computed(() => ({
    "scrollbar-thin lg:scrollbar-none hover:scrollbar-thin pr-2 lg:pr-4":
      layout.value === "grid",
    "scrollbar-thin w-full max-w-xl mx-auto lg:scrollbar-none hover:scrollbar-thin pr-2 lg:pr-4":
      layout.value === "list",
  }));

  const conatinerStyles = computed(() => ({
    "flex-wrap": layout.value === "grid",
    "flex-col": layout.value === "list",
  }));

  return {
    conatinerStyles,
    containerParentStyles,
  };
};
