<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
</script>
<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <DashboardEmptyPage
      title="No reminders yet"
      subtitle="Set reminders to get notified when a note is due"
    />
  </main>
</template>
