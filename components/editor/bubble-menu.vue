<script setup lang="ts">
import type { Editor as BaseEditor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/vue-3";
import { BubbleMenu } from "@tiptap/vue-3/menus";
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Sparkles,
  Strikethrough,
  Underline,
} from "lucide-vue-next";

const { editor } = defineProps<{ editor: Editor }>();

const shouldShow = ({ editor }: { editor: BaseEditor }) => {
  const { selection } = editor.state;
  return (
    editor.isEditable &&
    selection instanceof TextSelection &&
    !selection.empty &&
    !editor.isActive("codeBlock") &&
    window.matchMedia("(pointer: fine)").matches
  );
};

const marks = [
  { name: "bold", label: "Bold", icon: Bold, toggle: "toggleBold" },
  { name: "italic", label: "Italic", icon: Italic, toggle: "toggleItalic" },
  {
    name: "underline",
    label: "Underline",
    icon: Underline,
    toggle: "toggleUnderline",
  },
  {
    name: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    toggle: "toggleStrike",
  },
  { name: "code", label: "Inline code", icon: Code, toggle: "toggleCode" },
] as const;
</script>
<template>
  <div>
    <BubbleMenu
      :editor
      :should-show="shouldShow"
      :options="{ placement: 'top', offset: 8 }"
      class="bg-popover text-popover-foreground flex items-center gap-0.5 rounded-lg border p-1 shadow-lg"
    >
      <EditorButton
        v-for="mark in marks"
        :key="mark.name"
        size="sm"
        :label="mark.label"
        :tooltip="mark.label"
        :icon="mark.icon"
        :active="editor.isActive(mark.name)"
        @toggled="editor.chain().focus()[mark.toggle]().run()"
      />
      <EditorButton
        size="sm"
        label="Highlight"
        tooltip="Highlight"
        :icon="Highlighter"
        :active="editor.isActive('highlight')"
        @toggled="
          editor.chain().focus().toggleHighlight({ color: '#00ffaa70' }).run()
        "
      />
      <div class="bg-border mx-0.5 h-5 w-px" />
      <EditorButton
        size="sm"
        label="Improve writing"
        tooltip="Improve writing"
        :icon="Sparkles"
        :active="false"
        :disabled="!editor.can().refine('refine')"
        @toggled="editor.commands.refine('refine')"
      />
    </BubbleMenu>
  </div>
</template>
