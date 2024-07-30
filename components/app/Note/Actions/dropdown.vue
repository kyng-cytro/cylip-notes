<script setup lang="ts">
import { EllipsisVertical, Plus } from "lucide-vue-next";

const query = ref("");
const { labels } = storeToRefs(useNoteStore());

defineEmits<{
  (e: "copy"): void;
  (e: "share"): void;
  (e: "assign"): void;
  (e: "delete"): void;
  (e: "archive"): void;
  (e: "versions"): void;
  (e: "set-remind"): void;
  (e: "toggle-show-preview"): void;
}>();
</script>
<template>
  <div @click.stop>
    <ClientOnly>
      <template #fallback>
        <Button variant="ghost" size="icon">
          <EllipsisVertical class="h-4 w-4" />
          <span class="sr-only">More actions</span>
        </Button>
      </template>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon">
            <EllipsisVertical class="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem @click="$emit('share')">Share</DropdownMenuItem>
            <DropdownMenuItem @click="$emit('archive')"
              >Archive</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('set-remind')"
              >Set Reminder</DropdownMenuItem
            >
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Extras</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem @click="$emit('copy')"
              >Make a Copy</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('toggle-show-preview')"
              >Toggle Preview</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('versions')"
              >Version History</DropdownMenuItem
            >
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger> Assign Label </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="p-0">
              <Command v-model:searchTerm="query">
                <CommandInput
                  id="group-filter"
                  placeholder="Filter group..."
                  auto-focus
                />
                <CommandList>
                  <CommandEmpty
                    class="flex flex-col items-center justify-center gap-2 p-4"
                  >
                    <span>No label with the name "{{ query }}".</span>
                    <AppCreateLabel v-model:value="query">
                      <template #trigger>
                        <Button variant="ghost" size="xs">
                          <Plus class="h-5 w-5" />
                          <span class="sr-only"
                            >Create a label with this name</span
                          >
                        </Button>
                      </template>
                    </AppCreateLabel>
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="all-notes">All Notes</CommandItem>
                    <CommandItem
                      v-for="label in labels"
                      :key="label.id"
                      :value="label.slug"
                    >
                      {{ capitalize(label.name) }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem class="text-red-600" @click="$emit('delete')"
              >Delete Note</DropdownMenuItem
            >
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ClientOnly>
  </div>
</template>
