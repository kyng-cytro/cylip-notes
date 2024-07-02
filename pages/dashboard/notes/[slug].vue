<script setup lang="ts">
const { slug } = useRoute("dashboard-notes-slug").params;
definePageMeta({
  layout: "dashboard",
});
</script>
<template>
  <div>{{ slug }} from page</div>
</template>
