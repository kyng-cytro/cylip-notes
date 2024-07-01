<script setup lang="ts">
import { Plus } from "lucide-vue-next";
definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <div class="flex items-center justify-between">
      <DashboardNoteGroupSelect />
      <div class="flex items-center gap-2">
        <DashboardNoteLayoutSelect />
        <Button variant="secondary" size="icon">
          <Plus />
          <span class="sr-only">Create new note</span>
        </Button>
      </div>
    </div>
    <DashboardNoteContainer />
    <!-- <DashboardEmptyPage -->
    <!--   title="No notes yet" -->
    <!--   subtitle="Create your first note to get started" -->
    <!--   :button="{ text: 'Create Note', to: '/dashboard/create-note' }" -->
    <!-- /> -->
  </main>
</template>
