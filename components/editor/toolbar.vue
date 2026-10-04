<script setup lang="ts">
import { HIGHLIGHT_COLOR } from "@/lib/tiptap";
import { pickImage } from "@/lib/tiptap/images";
import type { Editor } from "@tiptap/vue-3";
import {
  Bold,
  Highlighter,
  ImagePlus,
  Italic,
  Plus,
  Redo2,
  Underline,
  Undo2,
} from "lucide-vue-next";

const props = defineProps<{
  editor: Editor;
}>();

const disabled = computed(() => !props.editor.isEditable);
const touch = ref(false);

onMounted(() => (touch.value = !hasFinePointer()));
</script>
<template>
  <div
    class="-mx-1 flex scrollbar-none items-center gap-1 overflow-x-auto px-1"
    :class="{ 'lg:hidden': !touch }"
  >
    <EditorButton
      label="Insert block"
      tooltip="Insert block"
      :icon="Plus"
      :active="false"
      @toggled="openBlockMenu(editor)"
      :disabled="disabled"
    />
    <EditorBlockMenu :editor="editor" />
    <div class="bg-border h-5 w-px shrink-0" />
    <EditorButton
      label="Bold"
      tooltip="Bold"
      :icon="Bold"
      :active="editor.isActive('bold')"
      @toggled="editor.chain().focus().toggleBold().run()"
      :disabled="disabled"
    />
    <EditorButton
      label="Italic"
      tooltip="Italic"
      :icon="Italic"
      :active="editor.isActive('italic')"
      @toggled="editor.chain().focus().toggleItalic().run()"
      :disabled="disabled"
    />
    <EditorButton
      label="Underline"
      tooltip="Underline"
      :icon="Underline"
      :active="editor.isActive('underline')"
      @toggled="editor.chain().focus().toggleUnderline().run()"
      :disabled="disabled"
    />
    <EditorButton
      label="Highlight"
      tooltip="Highlight"
      :icon="Highlighter"
      :active="editor.isActive('highlight')"
      @toggled="
        editor.chain().focus().toggleHighlight({ color: HIGHLIGHT_COLOR }).run()
      "
      :disabled="disabled"
    />
    <EditorAiMenu :editor="editor" />
    <div class="bg-border h-5 w-px shrink-0" />
    <EditorButton
      label="Undo"
      tooltip="Undo"
      :icon="Undo2"
      :active="false"
      @toggled="editor.chain().focus().undo().run()"
      :disabled="disabled"
    />
    <EditorButton
      label="Redo"
      tooltip="Redo"
      :icon="Redo2"
      :active="false"
      @toggled="editor.chain().focus().redo().run()"
      :disabled="disabled"
    />
    <div class="bg-border h-5 w-px shrink-0" />
    <EditorButton
      label="Image"
      tooltip="Image"
      :icon="ImagePlus"
      :active="false"
      @toggled="pickImage(editor)"
      :disabled="disabled"
    />
  </div>
</template>
