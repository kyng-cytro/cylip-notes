<script setup lang="ts">
import { Plus } from "lucide-vue-next";
const { label } = storeToRefs(useLayoutStore());
const { labels, initialized } = storeToRefs(useNoteStore());
</script>
<template>
  <template v-if="!initialized">
    <Skeleton class="h-[2.25rem] w-[150px] rounded-md" />
  </template>
  <template v-if="initialized">
    <Select id="label-select" v-model="label">
      <SelectTrigger class="w-[150px] font-semibold">
        <SelectValue placeholder="Select a label" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all-notes" selected> All Notes </SelectItem>
          <SelectItem
            :value="label.slug"
            v-for="label in labels"
            :key="label.id"
          >
            {{ capitalize(label.name) }}
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <AppCreateLabel>
            <template #trigger>
              <Button variant="ghost" class="w-full" size="xs">
                <Plus class="h-5 w-5" />
                <span class="sr-only">Create new label</span>
              </Button>
            </template>
          </AppCreateLabel>
        </SelectGroup>
      </SelectContent>
    </Select>
  </template>
</template>
