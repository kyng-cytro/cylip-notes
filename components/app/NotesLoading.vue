<script setup lang="ts">
const { layout } = storeToRefs(useLayoutStore());
const count = 4;
const layoutStyles = computed(() => ({
  "grid gap-4 grid-cols-2": layout.value === "grid",
  "sm:grid-cols-[repeat(auto-fit,minmax(200px,max-content))]":
    layout.value === "grid" && count < 3,
  "sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(200px,0.15fr))]":
    layout.value === "grid" && count >= 3 && count < 5,
  "sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]":
    layout.value === "grid" && count >= 5,
  "grid-cols-1": layout.value === "list",
}));
</script>

<template>
  <div class="grid gap-4" :class="layoutStyles">
    <AppNoteSkeleton v-for="i in count" :key="i" />
  </div>
</template>
