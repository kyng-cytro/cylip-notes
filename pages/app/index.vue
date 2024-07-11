<script setup lang="ts">
import { Plus } from "lucide-vue-next";
definePageMeta({
  layout: "app",
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
    pinned: false,
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
]);

const pinnedNotes = computed(() => {
  return notes.value.filter((note) => note.pinned);
});

const otherNotes = computed(() => {
  return notes.value.filter((note) => !note.pinned);
});

const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "scrollbar-none hover:scrollbar": layout.value === "grid",
  "w-full max-w-xl mx-auto scrollbar-none hover:scrollbar-thin ":
    layout.value === "list",
}));

const { notes: x } = storeToRefs(useNoteStore());
</script>

<template>
  <main class="flex flex-1 flex-col gap-4 p-4 pb-0 lg:gap-6 lg:p-6 lg:pb-0">
    <div class="flex items-center justify-between">
      <AppNoteLabelSelect />
      <div class="flex items-center gap-2">
        <AppNoteLayoutSelect />
        <Button variant="secondary" size="icon">
          <Plus />
          <span class="sr-only">Create new note</span>
        </Button>
      </div>
    </div>
    <div
      class="flex max-h-[calc(100vh-150px)] flex-col gap-4 overflow-y-auto overflow-x-hidden p-1"
      :class="layoutStyles"
      v-if="notes.length"
    >
      <p
        class="text-sm font-semibold text-muted-foreground"
        v-if="pinnedNotes.length"
      >
        Pinned
      </p>
      <AppNoteContainer v-model:notes="pinnedNotes" v-if="pinnedNotes.length" />
      <p
        class="text-sm font-semibold text-muted-foreground"
        v-if="pinnedNotes.length"
      >
        Others
      </p>
      <AppNoteContainer v-model:notes="otherNotes" />
    </div>
    <template v-else>
      <AppEmptyPage
        title="No notes yet"
        subtitle="Create your first note to get started"
        :button="{ text: 'Create Note', to: '/app/create-note' }"
      />
    </template>
    <Transition name="modal">
      <PlusModalPage name="modal" />
    </Transition>
  </main>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
