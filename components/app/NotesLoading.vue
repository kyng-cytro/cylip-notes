<script setup lang="ts">
const { conatinerStyles: layoutStyles } = useLayout();
const heights = [
  50, 50, 150, 300, 200, 100, 250, 350, 150, 100, 400, 300, 250, 200, 50,
];
</script>

<template>
  <div :class="layoutStyles">
    <Skeleton
      v-for="i in 20"
      :key="i"
      class="mb-2 w-full break-inside-avoid"
      :style="{ height: `${heights[(i - 1) % heights.length]}px` }"
    />
  </div>
</template>
