<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";
const { editor } = defineProps<{ editor: Editor }>();
onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <editor-content :editor="editor" />
</template>
