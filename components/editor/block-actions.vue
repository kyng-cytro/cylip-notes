<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { ArrowDown, ArrowUp, Copy, Repeat2, Trash2 } from "lucide-vue-next";

const { editor, target } = defineProps<{
  editor: Editor;
  target: BlockTarget;
}>();

const convertibleBlocks = editorBlocks.filter((block) => block.convertible);
</script>
<template>
  <DropdownMenuItem
    :disabled="!canMoveBlock(editor, target, -1)"
    @select="moveBlock(editor, target, -1)"
  >
    <ArrowUp class="size-4" />
    Move up
  </DropdownMenuItem>
  <DropdownMenuItem
    :disabled="!canMoveBlock(editor, target, 1)"
    @select="moveBlock(editor, target, 1)"
  >
    <ArrowDown class="size-4" />
    Move down
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuSub>
    <DropdownMenuSubTrigger class="gap-2">
      <Repeat2 class="size-4" />
      Turn into
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent class="w-48">
      <DropdownMenuItem
        v-for="block in convertibleBlocks"
        :key="block.id"
        @select="turnBlockInto(editor, target, block)"
      >
        <component :is="block.icon" class="size-4" />
        {{ block.title }}
      </DropdownMenuItem>
    </DropdownMenuSubContent>
  </DropdownMenuSub>
  <DropdownMenuItem @select="duplicateBlock(editor, target)">
    <Copy class="size-4" />
    Duplicate
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem
    class="text-destructive"
    @select="deleteBlock(editor, target)"
  >
    <Trash2 class="size-4" />
    Delete
  </DropdownMenuItem>
</template>
