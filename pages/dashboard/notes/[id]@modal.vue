<script setup lang="ts">
import {
  Pin,
  Bold,
  Code,
  List,
  Undo2,
  Redo2,
  Italic,
  PinOff,
  Archive,
  Heading1,
  ListTodo,
  Underline,
  TextQuote,
  BellRing,
  Highlighter,
  ArrowLeft,
  ListOrdered,
} from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params;

const { editor } = useEditor();

const modal = ref<HTMLElement>();
useFocus(modal, { initialValue: true });

const openNote = () => {
  return navigateTo(`/dashboard/notes/${id}`, {
    external: true,
  });
};
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
  >
    <Card
      class="z-50 flex h-full w-full max-w-2xl flex-col lg:max-h-[80%]"
      ref="modal"
      tabindex="-1"
      @click.stop
    >
      <CardHeader>
        <div class="flex items-center justify-between">
          <TooltipWrapper tooltip="Close note">
            <Button
              class="rounded-full px-0 text-muted-foreground"
              variant="ghost"
              size="xs"
              @click="useModalRouter().close()"
            >
              <ArrowLeft class="size-5" />
            </Button>
          </TooltipWrapper>
          <div class="flex items-center gap-2 text-muted-foreground">
            <TooltipWrapper tooltip="Pin note">
              <Button variant="ghost" size="xs">
                <PinOff class="size-5" v-if="false" />
                <Pin class="size-5" v-else />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="Remind me">
              <Button variant="ghost" size="xs">
                <BellRing class="size-5" />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="Archive">
              <Button variant="ghost" size="xs">
                <Archive class="size-5" />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
      </CardHeader>
      <CardContent class="flex-1 space-y-4 overflow-y-auto scrollbar-none">
        <DashboardNoteTitleInput @open-note="openNote" />
        <Editor :editor="editor" />
      </CardContent>
      <CardFooter class="flex justify-between gap-2 border-t py-2">
        <div
          class="flex items-center gap-2 overflow-y-auto text-muted-foreground scrollbar-none"
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
            :icon="TextQuote"
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
        <p
          class="whitespace-nowrap text-sm font-medium leading-none text-muted-foreground"
        >
          Edited: Jun 12
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
