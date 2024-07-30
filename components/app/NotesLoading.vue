<script setup lang="ts">
const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "flex-wrap": layout.value === "grid",
  "flex-col": layout.value === "list",
}));
</script>

<template>
  <div class="flex gap-4" :class="layoutStyles">
    <AppNoteSkeleton v-for="i in 3" :key="i" />
    <AppNoteSkeleton v-for="i in 3" :key="i" preview />
  </div>
</template>
