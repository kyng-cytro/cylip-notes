<script setup lang="ts">
const { slug } = useRoute("dashboard-notes-slug").params;
definePageMeta({
  layout: "dashboard",
});
</script>
<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    {{ slug }}
  </main>
</template>
