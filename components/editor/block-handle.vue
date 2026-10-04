<script setup lang="ts">
import { DragHandle } from "@tiptap/extension-drag-handle-vue-3";
import type { Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/vue-3";
import { GripVertical, Plus } from "lucide-vue-next";

const { editor } = defineProps<{ editor: Editor }>();

const target = shallowRef<BlockTarget | null>(null);
const menuOpen = ref(false);
const handlePosition = { placement: "left-start" } as const;

const onNodeChange = ({ node, pos }: { node: Node | null; pos: number }) => {
  target.value = node ? { node, pos } : null;
  editor.commands.hoverBlock(node ? pos : null);
};

const onMenuOpen = (open: boolean) => {
  menuOpen.value = open;
  editor.commands.setMeta("lockDragHandle", open);
  if (open && target.value) editor.commands.setNodeSelection(target.value.pos);
};

const withTarget = (action: (editor: Editor, target: BlockTarget) => void) => {
  if (target.value) action(editor, target.value);
};
</script>
<template>
  <div>
    <DragHandle
      :editor
      :on-node-change="onNodeChange"
      :compute-position-config="handlePosition"
      class="hidden items-center pr-1 lg:flex"
    >
      <button
        type="button"
        aria-label="Add block below"
        class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded"
        @click="withTarget(insertBlockAfter)"
      >
        <Plus class="size-4" />
      </button>
      <DropdownMenu :open="menuOpen" @update:open="onMenuOpen">
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            aria-label="Block actions"
            class="text-muted-foreground hover:bg-accent hover:text-foreground flex h-6 w-5 cursor-grab items-center justify-center rounded"
          >
            <GripVertical class="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start" class="w-52">
          <EditorBlockActions v-if="target" :editor="editor" :target="target" />
        </DropdownMenuContent>
      </DropdownMenu>
    </DragHandle>
  </div>
</template>
