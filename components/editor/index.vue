<script setup lang="ts">
import { EditorContent, type Editor } from "@tiptap/vue-3";
import { DragHandle } from "@tiptap/extension-drag-handle-vue-3";
import { GripVerticalIcon } from "lucide-vue-next";
const { editor } = defineProps<{ editor: Editor; initialized: boolean }>();
onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <template v-if="initialized">
    <ContextMenu :modal="false">
      <drag-handle
        :editor
        :tippy-options="{ offset: [0, 4] }"
        class="bg-secondary hidden w-min cursor-grab items-center justify-center rounded-sm border-1 p-1 lg:flex"
      >
        <GripVerticalIcon class="size-5" />
      </drag-handle>
      <ContextMenuTrigger>
        <editor-content :editor class="h-full w-full" />
      </ContextMenuTrigger>
      <ContextMenuContent class="w-64">
        <EditorContextMenu :editor="editor" />
      </ContextMenuContent>
    </ContextMenu>
  </template>
  <EditorLoading v-else />
</template>
