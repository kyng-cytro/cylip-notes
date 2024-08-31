<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";
const { editor } = defineProps<{ editor: Editor; initialized: boolean }>();
onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <editor-content :editor oncontextmenu="return false;" v-if="initialized" />
  <Skeleton class="min-h-full w-full" v-else />
</template>
