<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { Sparkles } from "lucide-vue-next";

const { editor } = defineProps<{ editor: Editor }>();

const refineModes = [
  { mode: "refine", label: "Improve writing" },
  { mode: "shorten", label: "Make shorter" },
  { mode: "lengthen", label: "Make longer" },
  { mode: "formal", label: "Make formal" },
] as const;
</script>
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        aria-label="AI tools"
        class="shrink-0"
        :disabled="!editor.isEditable"
      >
        <Sparkles class="size-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" align="start" class="w-52">
      <template v-if="editor.can().accept()">
        <DropdownMenuItem @select="editor.commands.accept()">
          Accept suggestion
        </DropdownMenuItem>
        <DropdownMenuItem @select="editor.commands.discard()">
          Discard suggestion
        </DropdownMenuItem>
      </template>
      <template v-else>
        <DropdownMenuItem
          :disabled="!editor.can().suggest()"
          @select="editor.commands.suggest()"
        >
          Suggest what comes next
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel class="text-muted-foreground text-xs font-normal">
          With text selected
        </DropdownMenuLabel>
        <DropdownMenuItem
          v-for="item in refineModes"
          :key="item.mode"
          :disabled="!editor.can().refine(item.mode)"
          @select="editor.commands.refine(item.mode)"
        >
          {{ item.label }}
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
