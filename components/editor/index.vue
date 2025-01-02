<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";
import { DragHandle } from "@tiptap-pro/extension-drag-handle-vue-3";
import { GripVerticalIcon } from "lucide-vue-next";
const { editor } = defineProps<{ editor: Editor; initialized: boolean }>();
onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <template v-if="initialized">
    <drag-handle
      :editor
      :tippy-options="{ offset: [0, 4] }"
      class="border-1 hidden w-min cursor-grab items-center justify-center rounded-sm bg-secondary p-1 lg:flex"
    >
      <GripVerticalIcon class="size-5" />
    </drag-handle>
    <editor-content class="h-full w-full" :editor />
  </template>
  <EditorLoading v-else />
</template>
