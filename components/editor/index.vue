<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";

const { editor } = defineProps<{ editor: Editor }>();

onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <ContextMenu :modal="false">
    <EditorBlockHandle :editor />
    <EditorBubbleMenu :editor />
    <ContextMenuTrigger>
      <editor-content :editor class="h-full w-full" />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64">
      <EditorContextMenu :editor="editor" />
    </ContextMenuContent>
  </ContextMenu>
</template>
