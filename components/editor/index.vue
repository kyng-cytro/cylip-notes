<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";

const KEYBOARD_MIN_HEIGHT = 100;

const { editor } = defineProps<{ editor: Editor }>();

const finePointer = ref(false);
const viewportHeight = ref(0);

const onViewportResize = () => {
  const height = window.visualViewport?.height ?? 0;
  const keyboardOpened = viewportHeight.value - height > KEYBOARD_MIN_HEIGHT;
  viewportHeight.value = height;
  if (keyboardOpened && editor.isFocused) editor.commands.scrollIntoView();
};

useEventListener(
  () => (import.meta.client ? window.visualViewport : null),
  "resize",
  onViewportResize,
);

onMounted(() => {
  finePointer.value = hasFinePointer();
  viewportHeight.value = window.visualViewport?.height ?? 0;
});

onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <ContextMenu :modal="false">
    <EditorBlockHandle v-if="finePointer" :editor />
    <EditorBubbleMenu :editor />
    <ContextMenuTrigger :disabled="!finePointer">
      <editor-content :editor class="h-full w-full" />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64">
      <EditorContextMenu :editor="editor" />
    </ContextMenuContent>
  </ContextMenu>
</template>
