<script setup lang="ts">
const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "grid gap-4 grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]":
    layout.value === "grid",
  "grid-cols-1": layout.value === "list",
}));
</script>

<template>
  <div class="grid gap-4" :class="layoutStyles">
    <AppNoteSkeleton v-for="i in 4" :key="i" />
  </div>
</template>
