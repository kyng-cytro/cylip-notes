export const useLayout = () => {
  const { layout } = storeToRefs(useLayoutStore());

  const containerParentStyles = computed(() => ({
    "relative scrollbar-thin pr-2": layout.value === "grid",
    "relative scrollbar-thin w-full max-w-xl mx-auto pr-2":
      layout.value === "list",
  }));

  const conatinerStyles = computed(() => ({
    "gap-2 columns-[150px] sm:columns-[250px]": layout.value === "grid",
    "flex gap-4 flex-col": layout.value === "list",
  }));

  return {
    conatinerStyles,
    containerParentStyles,
  };
};
