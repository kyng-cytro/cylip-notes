<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

const props = defineProps<{
  editor: Editor;
}>();

const disabled = computed(() => !props.editor.isEditable);

const handleCopy = () => {
  props.editor.chain().focus().run();
  document.execCommand("copy");
};

const handleCut = () => {
  props.editor.chain().focus().run();
  document.execCommand("cut");
};

const handlePaste = async () => {
  props.editor.chain().focus().run();
  const text = await navigator.clipboard.readText();
  props.editor.commands.insertContent(text);
};
</script>

<template>
  <ContextMenuItem inset>Back</ContextMenuItem>
  <ContextMenuItem @click="handleCopy" inset
    >Copy
    <ContextMenuShortcut>⌘C</ContextMenuShortcut>
  </ContextMenuItem>
  <ContextMenuItem :disabled="disabled" @click="handleCut" inset
    >Cut
    <ContextMenuShortcut>⌘X</ContextMenuShortcut>
  </ContextMenuItem>
  <ContextMenuItem @click="handlePaste" inset :disabled="disabled"
    >Paste
    <ContextMenuShortcut>⌘V</ContextMenuShortcut>
  </ContextMenuItem>
  <ContextMenuItem @click="editor.commands.selectAll()" inset
    >Select All
    <ContextMenuShortcut>⌘A</ContextMenuShortcut>
  </ContextMenuItem>
  <ContextMenuSeparator />
  <!--- Undo/Redo -->
  <ContextMenuItem
    :disabled="disabled || !editor.can().undo()"
    @click="editor.commands.undo()"
    inset
    >Undo
    <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
  </ContextMenuItem>
  <ContextMenuItem
    :disabled="disabled || !editor.can().redo()"
    @click="editor.commands.redo()"
    inset
    >Redo
    <ContextMenuShortcut>⌘⇧Z</ContextMenuShortcut>
  </ContextMenuItem>
  <ContextMenuSeparator />
  <!-- Formatting -->
  <ContextMenuSub>
    <ContextMenuSubTrigger inset> Formatting </ContextMenuSubTrigger>
    <ContextMenuSubContent class="w-48">
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('bold')"
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="disabled"
        >Bold
        <ContextMenuShortcut>⌘B</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('italic')"
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="disabled"
        >Italic
        <ContextMenuShortcut>⌘I</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('heading')"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :disabled="disabled"
        >Heading
        <ContextMenuShortcut>⌘4</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('underline')"
        @click="editor.chain().focus().toggleUnderline().run()"
        :disabled="disabled"
        >Underline
        <ContextMenuShortcut>⌘U</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
    </ContextMenuSubContent>
  </ContextMenuSub>
  <!-- Listing -->
  <ContextMenuSub>
    <ContextMenuSubTrigger inset> Listing </ContextMenuSubTrigger>
    <ContextMenuSubContent class="w-48">
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('taskList')"
        @click="editor.chain().focus().toggleTaskList().run()"
        :disabled="disabled"
        >Task list
        <ContextMenuShortcut>⌘⇧9</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('bulletList')"
        @click="editor.chain().focus().toggleBulletList().run()"
        :disabled="disabled"
        >Bullet list
        <ContextMenuShortcut>⌘⇧8</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :disabled="disabled"
        >Numbered list
        <ContextMenuShortcut>⌘⇧7</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
    </ContextMenuSubContent>
  </ContextMenuSub>
  <!-- More Tools -->
  <ContextMenuSub>
    <ContextMenuSubTrigger inset> More Tools </ContextMenuSubTrigger>
    <ContextMenuSubContent class="w-48">
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('highlight')"
        @click="editor.chain().focus().toggleHighlight().run()"
        :disabled="disabled"
        >Highlight
        <ContextMenuShortcut>⌘⇧H</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('blockquote')"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :disabled="disabled"
        >Blockquote
        <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        inset
        :checked="editor.isActive('codeBlock')"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :disabled="disabled"
        >Code block
        <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
    </ContextMenuSubContent>
  </ContextMenuSub>
</template>
