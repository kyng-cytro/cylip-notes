<script setup lang="ts">
const { conatinerStyles: layoutStyles } = useLayout();
</script>

<template>
  <div class="flex gap-4" :class="layoutStyles">
    <AppNoteSkeleton v-for="i in 5" :key="i" preview />
  </div>
</template>
