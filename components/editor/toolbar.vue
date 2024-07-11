<script setup lang="ts">
import {
  Bold,
  Code,
  List,
  Undo2,
  Redo2,
  Italic,
  Heading1,
  ListTodo,
  Underline,
  Highlighter,
  ListOrdered,
  MessageSquareQuote,
} from "lucide-vue-next";
import type { Editor } from "@tiptap/vue-3";

defineProps<{
  editor: Editor;
}>();
</script>
<template>
  <div
    class="flex items-center justify-between overflow-y-auto pb-2 text-muted-foreground scrollbar-thin hover:scrollbar-thin lg:pb-0 lg:scrollbar-none"
  >
    <EditorButton
      label="Heading"
      tooltip="Heading"
      :icon="Heading1"
      :active="editor.isActive('heading', { level: 3 })"
      @toggled="editor.chain().focus().toggleHeading({ level: 3 }).run()"
    />
    <EditorButton
      label="Bold"
      tooltip="Bold"
      :icon="Bold"
      :active="editor.isActive('bold')"
      @toggled="editor.chain().focus().toggleBold().run()"
    />
    <EditorButton
      label="Italic"
      tooltip="Italic"
      :icon="Italic"
      :active="editor.isActive('italic')"
      @toggled="editor.chain().focus().toggleItalic().run()"
    />
    <EditorButton
      label="Underline"
      tooltip="Underline"
      :icon="Underline"
      :active="editor.isActive('underline')"
      @toggled="editor.chain().focus().toggleUnderline().run()"
    />
    <div class="h-5 w-px bg-border" />
    <EditorButton
      label="Undo"
      tooltip="Undo"
      :icon="Undo2"
      :active="editor.isActive('undo')"
      @toggled="editor.chain().focus().undo().run()"
    />
    <EditorButton
      label="Redo"
      tooltip="Redo"
      :icon="Redo2"
      :active="editor.isActive('redo')"
      @toggled="editor.chain().focus().redo().run()"
    />
    <div class="h-5 w-px bg-border" />
    <EditorButton
      label="Block Quote"
      tooltip="Block Quote"
      :icon="MessageSquareQuote"
      :active="editor.isActive('blockquote')"
      @toggled="editor.chain().focus().toggleBlockquote().run()"
    />
    <EditorButton
      label="Code Block"
      tooltip="Code Block"
      :icon="Code"
      :active="editor.isActive('codeBlock')"
      @toggled="editor.chain().focus().toggleCodeBlock().run()"
    />
    <EditorButton
      label="Highlighter"
      tooltip="Highlighter"
      :icon="Highlighter"
      :active="editor.isActive('highlight')"
      @toggled="editor.chain().focus().toggleHighlight().run()"
    />
    <div class="h-5 w-px bg-border" />
    <EditorButton
      label="Task List"
      tooltip="Task List"
      :icon="ListTodo"
      :active="editor.isActive('taskList')"
      @toggled="editor.chain().focus().toggleTaskList().run()"
    />
    <EditorButton
      label="Bullet List"
      tooltip="Bullet List"
      :icon="List"
      :active="editor.isActive('bulletList')"
      @toggled="editor.chain().focus().toggleBulletList().run()"
    />
    <EditorButton
      label="Numbered List"
      tooltip="Numbered List"
      :icon="ListOrdered"
      :active="editor.isActive('orderedList')"
      @toggled="editor.chain().focus().toggleOrderedList().run()"
    />
  </div>
</template>
