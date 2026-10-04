<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { GripVertical } from "lucide-vue-next";

const { editor } = defineProps<{ editor: Editor }>();

const target = shallowRef<BlockTarget | null>(null);

const onOpen = (open: boolean) => {
  if (open) target.value = blockAtCursor(editor);
};
</script>
<template>
  <DropdownMenu @update:open="onOpen">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Block actions"
        class="shrink-0"
      >
        <GripVertical class="size-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      side="top"
      align="start"
      class="w-52"
      @close-auto-focus.prevent
    >
      <EditorBlockActions v-if="target" :editor="editor" :target="target" />
      <DropdownMenuLabel
        v-else
        class="text-muted-foreground text-xs font-normal"
      >
        Tap a block first
      </DropdownMenuLabel>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
