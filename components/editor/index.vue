<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";
const { editor } = defineProps<{ editor: Editor; initialized: boolean }>();
onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <editor-content
    class="h-full w-full"
    :editor
    oncontextmenu="return false;"
    v-if="initialized"
  />
  <EditorLoading v-else />
</template>
