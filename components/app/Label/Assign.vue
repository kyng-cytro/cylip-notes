<script setup lang="ts">
import { Check, Plus } from "lucide-vue-next";
defineProps<{
  labelId: string | null;
  labels: Label[];
}>();
defineEmits<{
  (e: "assign-label", labelId: string | null): void;
}>();
const query = defineModel<string>();
</script>
<template>
  <Command v-model:searchTerm="query">
    <CommandInput id="group-filter" placeholder="Filter group..." auto-focus />
    <CommandList>
      <CommandEmpty class="flex flex-col items-center justify-center gap-2 p-4">
        <span>No label with the name "{{ query }}".</span>
        <AppLabelCreate v-model:value="query">
          <template #trigger="{ disabled }">
            <Button variant="ghost" size="xs" :disabled>
              <Plus class="h-5 w-5" />
              <span class="sr-only">Create a label with this name</span>
            </Button>
          </template>
        </AppLabelCreate>
      </CommandEmpty>
      <CommandGroup>
        <CommandItem value="all-notes" @select="$emit('assign-label', null)"
          >All Notes

          <Check class="ml-auto size-4" v-if="!labelId" />
        </CommandItem>
        <CommandItem
          v-for="label in labels"
          :key="label.id"
          :value="label.slug"
          @select="$emit('assign-label', label.id)"
        >
          {{ capitalize(label.name) }}

          <Check class="ml-auto size-4" v-if="label.id === labelId" />
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
