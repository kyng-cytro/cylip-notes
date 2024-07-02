<script setup lang="ts">
const slug = useRoute("dashboard-notes-slug@modal").params;
definePageMeta({
  layout: "dashboard",
});
</script>
<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm"
  >
    {{ slug }} from modal
  </div>
</template>
