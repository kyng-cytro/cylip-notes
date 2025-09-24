<script setup lang="ts">
import { Search } from "lucide-vue-next";
</script>
<template>
  <ClientOnly>
    <Popover>
      <PopoverTrigger as-child>
        <form>
          <div class="relative">
            <Search
              class="text-muted-foreground absolute top-2.5 left-2.5 size-4"
            />
            <Input
              id="search"
              type="search"
              spellcheck="false"
              autocomplete="off"
              placeholder="Search notes..."
              class="bg-background w-full appearance-none pl-8 shadow-none sm:w-2/3"
            />
          </div>
        </form>
      </PopoverTrigger>
      <PopoverContent align="start" class="min-w-full">
        <div class="flex h-full items-center justify-center">
          <h3 class="text-muted-foreground text-sm">
            Searching notes is under development.
          </h3>
        </div>
        <!-- Arrow -->
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
