<script setup lang="ts">
import { isSharedNote } from "@/lib/notes";
import type { SearchResult } from "@/lib/sync/search";

const { result } = defineProps<{ result: SearchResult }>();

const tags = computed(() => {
  const { note } = result;
  return [
    note.label?.name,
    isSharedNote(note) && "Shared",
    note.archived && "Archived",
    note.trashed && "Trash",
  ].filter((tag): tag is string => !!tag);
});
</script>
<template>
  <div class="flex min-w-0 flex-col gap-1">
    <div class="flex min-w-0 items-center gap-2">
      <span class="truncate text-sm font-semibold">
        {{ result.note.title || "Untitled note" }}
      </span>
      <Badge
        v-for="tag in tags"
        :key="tag"
        variant="secondary"
        class="shrink-0 px-1.5 py-0 text-[10px] capitalize"
      >
        {{ tag }}
      </Badge>
    </div>
    <p
      v-if="result.snippet"
      v-html="result.snippet"
      class="text-muted-foreground [&_mark]:text-foreground line-clamp-2 text-xs [&_mark]:rounded-sm [&_mark]:bg-yellow-300/50"
    />
  </div>
</template>
