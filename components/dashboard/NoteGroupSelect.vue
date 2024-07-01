<script setup lang="ts">
import { Plus } from "lucide-vue-next";
const selected = ref("all-notes");
</script>
<template>
  <Select id="group-select" v-model="selected">
    <SelectTrigger class="w-[150px] font-semibold">
      <SelectValue placeholder="Select a group" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="all-notes"> All Notes </SelectItem>
      </SelectGroup>
      <SelectGroup>
        <TooltipWrapper tooltip="Create a new group">
          <Button variant="ghost" class="w-full" size="xs">
            <Plus class="h-5 w-5" />
            <span class="sr-only">Create new group</span>
          </Button>
        </TooltipWrapper>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
