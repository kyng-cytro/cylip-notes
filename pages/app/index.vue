<script setup lang="ts">
import { Plus } from "lucide-vue-next";
definePageMeta({
  layout: "app",
});

const { notes, initialized, pinnedNotes } = storeToRefs(useNoteStore());

const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "scrollbar-thin lg:scrollbar-none hover:scrollbar-thin pr-2 lg:pr-0":
    layout.value === "grid",
  "scrollbar-thin w-full max-w-xl mx-auto lg:scrollbar-none hover:scrollbar-thin pr-2 lg:pr-0":
    layout.value === "list",
}));
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
    <template v-if="!notes.length">
      <AppEmptyPage
        title="No notes yet"
        subtitle="Create your first note to get started"
        :button="{ text: 'Create Note', to: '/app/create-note' }"
        v-if="initialized"
      />
      <div v-else>Loading...</div>
    </template>
    <template v-else>
      <div
        class="flex max-h-[calc(100vh-150px)] flex-col gap-4 overflow-y-auto overflow-x-hidden p-1"
        :class="layoutStyles"
      >
        <p
          class="text-sm font-semibold text-muted-foreground"
          v-if="pinnedNotes.length"
        >
          Pinned
        </p>
        <AppNoteContainer
          v-model:notes="pinnedNotes"
          v-if="pinnedNotes.length"
        />
        <p
          class="text-sm font-semibold text-muted-foreground"
          v-if="pinnedNotes.length"
        >
          Others
        </p>
        <AppNoteContainer v-model:notes="notes" />
      </div>
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