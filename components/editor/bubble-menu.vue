<script setup lang="ts">
import { HIGHLIGHT_COLOR } from "@/lib/tiptap";
import type { Editor as BaseEditor, ChainedCommands } from "@tiptap/core";
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

type Mark = {
  name: string;
  label: string;
  icon: Component;
  toggle: (chain: ChainedCommands) => ChainedCommands;
};

const { editor } = defineProps<{ editor: Editor }>();

const shouldShow = ({ editor }: { editor: BaseEditor }) => {
  const { selection } = editor.state;
  return (
    editor.isEditable &&
    selection instanceof TextSelection &&
    !selection.empty &&
    !editor.isActive("codeBlock") &&
    hasFinePointer()
  );
};

const marks: Mark[] = [
  { name: "bold", label: "Bold", icon: Bold, toggle: (chain) => chain.toggleBold() },
  {
    name: "italic",
    label: "Italic",
    icon: Italic,
    toggle: (chain) => chain.toggleItalic(),
  },
  {
    name: "underline",
    label: "Underline",
    icon: Underline,
    toggle: (chain) => chain.toggleUnderline(),
  },
  {
    name: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    toggle: (chain) => chain.toggleStrike(),
  },
  {
    name: "code",
    label: "Inline code",
    icon: Code,
    toggle: (chain) => chain.toggleCode(),
  },
  {
    name: "highlight",
    label: "Highlight",
    icon: Highlighter,
    toggle: (chain) => chain.toggleHighlight({ color: HIGHLIGHT_COLOR }),
  },
];

const toggleMark = (mark: Mark) => mark.toggle(editor.chain().focus()).run();
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
        @toggled="toggleMark(mark)"
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
