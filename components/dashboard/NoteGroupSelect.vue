<script setup lang="ts">
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
    </SelectContent>
  </Select>
</template>
