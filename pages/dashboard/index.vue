<script setup lang="ts">
import { Plus } from "lucide-vue-next";
definePageMeta({
  layout: "dashboard",
});

const notes = ref([
  {
    id: 1,
    title: "Note 1",
    content: "Sample note",
    pinned: false,
  },
  {
    id: 2,
    title: "Note 2",
    content: "Sample note",
  },
  {
    id: 3,
    title: "Note 3",
    content: "Sample note",
    pinned: false,
  },
  {
    id: 4,
    title: "Note 4",
    content: "Sample note",
  },
  {
    id: 5,
    title: "Note 5",
    content: "Sample note",
  },
  {
    id: 6,
    title: "Note 6",
    content: "Sample note",
  },
  {
    id: 7,
    title: "Note 7",
    content: "Sample note",
    pinned: false,
  },
  {
    id: 8,
    title: "Note 8",
    content: "Sample note",
  },
  {
    id: 9,
    title: "Note 9",
    content: "Sample note",
  },
  {
    id: 10,
    title: "Note 10",
    content: "Sample note",
  },
  {
    id: 11,
    title: "Note 11",
    content: "Sample note",
    pinned: false,
  },
  {
    id: 12,
    title: "Note 12",
    content: "Sample note",
  },
  {
    id: 13,
    title: "Note 13",
    content: "Sample note",
    pinned: false,
  },
  {
    id: 14,
    title: "Note 14",
    content: "Sample note",
  },
  {
    id: 15,
    title: "Note 15",
    content: "Sample note",
  },
  {
    id: 16,
    title: "Note 16",
    content: "Sample note",
    pinned: false,
  },
  {
    id: 17,
    title: "Note 17",
    content: "Sample note",
  },
]);

const pinnedNotes = computed(() => {
  return notes.value.filter((note) => note.pinned);
});

const otherNotes = computed(() => {
  return notes.value.filter((note) => !note.pinned);
});
</script>

<template>
  <main class="flex flex-1 flex-col gap-4 p-4 pb-0 lg:gap-6 lg:p-6 lg:pb-0">
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
    <div
      class="flex max-h-[calc(100vh-150px)] flex-col gap-4 overflow-y-auto scrollbar-thin"
      v-if="notes.length"
    >
      <p
        class="text-sm font-semibold text-muted-foreground"
        v-if="pinnedNotes.length"
      >
        Pinned
      </p>
      <DashboardNoteContainer
        v-model:notes="pinnedNotes"
        v-if="pinnedNotes.length"
      />
      <p
        class="text-sm font-semibold text-muted-foreground"
        v-if="pinnedNotes.length"
      >
        Others
      </p>
      <DashboardNoteContainer v-model:notes="otherNotes" />
    </div>
    <template v-else>
      <DashboardEmptyPage
        title="No notes yet"
        subtitle="Create your first note to get started"
        :button="{ text: 'Create Note', to: '/dashboard/create-note' }"
      />
    </template>
  </main>
</template>
