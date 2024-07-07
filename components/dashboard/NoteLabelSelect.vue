<script setup lang="ts">
import { Plus } from "lucide-vue-next";
const { label } = storeToRefs(useLayoutStore());
</script>
<template>
  <Select id="label-select" v-model="label">
    <SelectTrigger class="w-[150px] font-semibold">
      <SelectValue placeholder="Select a label" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="all-notes"> All Notes </SelectItem>
      </SelectGroup>
      <SelectGroup>
        <DashboardCreateLabel>
          <template #trigger>
            <Button variant="ghost" class="w-full" size="xs">
              <Plus class="h-5 w-5" />
              <span class="sr-only">Create new label</span>
            </Button>
          </template>
        </DashboardCreateLabel>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
