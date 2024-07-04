<script setup lang="ts">
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Editor, EditorContent } from "@tiptap/vue-3";
import Placeholder from "@tiptap/extension-placeholder";
import FileHandler from "@tiptap-pro/extension-file-handler";

const content = defineModel({ default: "" });

const editor = new Editor({
  content: content.value,
  editorProps: {
    attributes: {
      class: "prose dark:prose-invert outline-none",
    },
  },
  extensions: [
    Link,
    Image,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    StarterKit.configure({ heading: { levels: [3] } }),
    Placeholder.configure({ placeholder: "Note it down..." }),
    FileHandler.configure({
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/svg+xml",
      ],
      onDrop: (currentEditor, files, pos) => {
        console.log(files);
      },
      onPaste: (currentEditor, files, htmlContent) => {
        console.log(files);
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML();
  },
});

onBeforeUnmount(() => {
  editor.destroy();
});
</script>
<template>
  <editor-content :editor="editor" />
</template>

<style>
/* Basic editor styles */
.tiptap :first-child {
  margin-top: 0;
}

/* List styles */
.tiptap ul,
.tiptap ol {
  padding: 0 1rem;
  margin: 1.25rem 1rem 1.25rem 0.4rem;
}

.tiptap ul li p,
.tiptap ol li p {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

/* Placeholder styles */
.tiptap p.is-editor-empty:first-child::before {
  @apply text-muted-foreground;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Task list specific styles */
.tiptap ul[data-type="taskList"] {
  list-style: none;
  margin-left: 0;
  padding: 0;
}

.tiptap ul[data-type="taskList"] li {
  align-items: flex-start;
  display: flex;
}

.tiptap ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.tiptap ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

.tiptap ul[data-type="taskList"] input[type="checkbox"] {
  cursor: pointer;
}

.tiptap ul[data-type="taskList"] ul[data-type="taskList"] {
  margin: 0;
}
</style>
