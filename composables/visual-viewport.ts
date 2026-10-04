export const useVisualViewportBox = () => {
  const box = reactive({ top: 0, height: 0 });
  const update = () => {
    const viewport = window.visualViewport;
    if (viewport)
      Object.assign(box, { top: viewport.offsetTop, height: viewport.height });
  };
  const target = () => (import.meta.client ? window.visualViewport : null);
  useEventListener(target, "resize", update);
  useEventListener(target, "scroll", update);
  onMounted(update);
  return computed(() =>
    box.height ? { top: `${box.top}px`, height: `${box.height}px` } : {},
  );
};
