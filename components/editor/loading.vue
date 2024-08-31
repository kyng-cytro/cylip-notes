<script setup lang="ts">
const config = [
  { style: "h-2 w-2/3" },
  { style: "h-2 w-full" },
  { style: "h-2 w-full" },
  { style: "h-2 w-1/3" },
  { style: "h-[60%] w-full" },
  { style: "h-2 w-full" },
  { style: "h-2 w-full" },
  { style: "h-2 w-2/3" },
  { style: "h-[10%] w-full" },
];
</script>
<template>
  <div class="h-full space-y-3 lg:space-y-2.5">
    <Skeleton
      :key="index"
      :class="item.style"
      v-for="(item, index) in config"
    />
  </div>
</template>
