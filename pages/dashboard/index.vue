<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <div class="flex items-center justify-between">
      <DashboardNoteGroupSelect />
      <DashboardNoteLayoutSelect />
    </div>
    <DashboardNoteContainer />
    <!-- <DashboardEmptyPage -->
    <!--   title="No notes yet" -->
    <!--   subtitle="Create your first note to get started" -->
    <!--   :button="{ text: 'Create Note', to: '/dashboard/create-note' }" -->
    <!-- /> -->
  </main>
</template>
