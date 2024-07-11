<script setup lang="ts">
const { id } = useRoute("app-notes-id").params;
definePageMeta({
  layout: "app",
});
</script>
<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    {{ id }}
  </main>
</template>
