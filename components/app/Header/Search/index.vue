<script setup lang="ts">
import type { SearchResult } from "@/lib/sync/search";
import { Search } from "lucide-vue-next";
import {
  ListboxContent,
  ListboxFilter,
  ListboxItem,
  ListboxRoot,
} from "reka-ui";

const open = ref(false);
const query = ref("");
const debouncedQuery = refDebounced(query, 150);
const shortcut = ref("Ctrl K");
const noteStore = useNoteStore();

const results = computed(() =>
  debouncedQuery.value.trim() ? noteStore.search(debouncedQuery.value) : [],
);

const openNote = (result: SearchResult) => {
  open.value = false;
  useModalRouter().push(`/app/notes/${result.note.id}`);
};

onKeyStroke("k", (event) => {
  if (!event.metaKey && !event.ctrlKey) return;
  event.preventDefault();
  open.value = true;
});

watch(open, (isOpen) => {
  if (!isOpen) query.value = "";
});

onMounted(() => {
  if (/Mac|iPhone|iPad/.test(navigator.userAgent)) shortcut.value = "⌘K";
});
</script>
<template>
  <Button
    variant="outline"
    class="bg-background text-muted-foreground w-full justify-start gap-2 px-3 font-normal shadow-none md:w-2/3 lg:w-1/3"
    @click="open = true"
  >
    <Search class="size-4 shrink-0" />
    <span class="truncate">Search notes...</span>
    <kbd
      class="bg-muted ml-auto hidden rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline"
    >
      {{ shortcut }}
    </kbd>
  </Button>
  <Dialog v-model:open="open">
    <DialogContent
      class="top-[15%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
    >
      <DialogTitle class="sr-only">Search notes</DialogTitle>
      <DialogDescription class="sr-only">
        Search note titles, content and labels.
      </DialogDescription>
      <ListboxRoot highlight-on-hover class="flex flex-col">
        <div class="flex h-12 items-center gap-2 border-b px-3">
          <Search class="text-muted-foreground size-4 shrink-0" />
          <ListboxFilter
            v-model="query"
            auto-focus
            placeholder="Search titles, content and labels"
            class="placeholder:text-muted-foreground h-full w-full bg-transparent text-sm outline-none"
          />
        </div>
        <ListboxContent
          class="max-h-[60dvh] scrollbar-thin overflow-y-auto p-2"
        >
          <p
            v-if="!results.length"
            class="text-muted-foreground py-6 text-center text-sm"
          >
            {{ debouncedQuery.trim() ? "No notes found." : "Type to search." }}
          </p>
          <ListboxItem
            v-for="result in results"
            :key="result.note.id"
            :value="result.note.id"
            class="data-[highlighted]:bg-accent cursor-pointer rounded-md p-2 outline-none"
            @select="openNote(result)"
          >
            <AppHeaderSearchItem :result="result" />
          </ListboxItem>
        </ListboxContent>
      </ListboxRoot>
    </DialogContent>
  </Dialog>
</template>
