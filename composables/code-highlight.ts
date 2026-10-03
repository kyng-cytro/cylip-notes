import hljs from "highlight.js";
import type { Ref } from "vue";

export const useCodeHighlight = (
  container: Ref<HTMLElement | null>,
  source: Ref<unknown>,
) => {
  const highlight = () =>
    container.value
      ?.querySelectorAll<HTMLElement>("pre code")
      .forEach((block) => hljs.highlightElement(block));
  watch(source, highlight, { flush: "post" });
  onMounted(highlight);
};
