<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { PopoverClose } from "reka-ui";

const q = ref("");
const query = refDebounced(q, 200);
const noteStore = useNoteStore();
const results = computed(() =>
  query.value ? noteStore.search(query.value) : [],
);

const replace = computed(() => {
  const path = useRoute().path;
  return path !== "/app" && !["reminders", "archive", "trash"].includes(path);
});
</script>
<template>
  <ClientOnly>
    <Popover>
      <PopoverTrigger as-child>
        <div class="relative md:w-2/3 lg:w-1/3">
          <Search
            class="text-muted-foreground absolute top-2.5 left-2.5 size-4"
          />
          <Input
            v-model="q"
            id="search"
            type="search"
            spellcheck="false"
            autocomplete="off"
            placeholder="Search notes..."
            class="bg-background no-clear w-full appearance-none pl-8 shadow-none"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        class="scrollbar-thumb-secondary max-h-96 scrollbar-thin scrollbar-track-transparent overflow-y-auto p-2 md:w-[450px]"
      >
        <div class="flex h-full flex-col items-center gap-4">
          <template v-if="!results.length">
            <h3 class="text-muted-foreground p-4 text-sm">
              {{ q ? "No results found." : "Search notes..." }}
            </h3>
          </template>
          <template v-else>
            <template :key="result.id" v-for="result in results">
              <PopoverClose as-child>
                <AppHeaderSearchItem :replace :item="result" />
              </PopoverClose>
            </template>
          </template>
        </div>
        <div
          class="bg-background absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l"
        />
      </PopoverContent>
    </Popover>
    <template #fallback>
      <Skeleton class="h-9 w-full md:w-2/3 lg:w-1/3" />
    </template>
  </ClientOnly>
</template>
