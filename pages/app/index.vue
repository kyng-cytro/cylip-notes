<script setup lang="ts">
import { Plus } from "lucide-vue-next";
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { normalNotes, initialized, pinnedNotes } = storeToRefs(notesStore);

const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "scrollbar-thin lg:scrollbar-none hover:scrollbar-thin pr-2 lg:pr-4":
    layout.value === "grid",
  "scrollbar-thin w-full max-w-xl mx-auto lg:scrollbar-none hover:scrollbar-thin pr-2 lg:pr-4":
    layout.value === "list",
}));
</script>

<template>
  <main class="flex flex-1 flex-col gap-4 p-4 pb-0 lg:gap-6 lg:p-6 lg:pb-0">
    <div class="flex items-center justify-between">
      <AppNoteLabelSelect />
      <div class="flex items-center gap-2">
        <AppNoteLayoutSelect />
        <Button
          variant="secondary"
          size="icon"
          @click="notesStore.methods.createNote"
        >
          <Plus />
          <span class="sr-only">Create new note</span>
        </Button>
      </div>
    </div>
    <template v-if="!normalNotes.length && !pinnedNotes.length">
      <AppEmptyPage
        title="No notes yet"
        subtitle="Create your first note to get started"
        :button="{ text: 'Create Note' }"
        @button-click="notesStore.methods.createNote"
        v-if="initialized"
      />
      <div
        class="flex max-h-[calc(100vh-150px)] flex-col gap-4 overflow-y-auto overflow-x-hidden p-1"
        v-else
        :class="layoutStyles"
      >
        <AppNotesLoading />
      </div>
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
        <AppNoteContainer v-model:notes="normalNotes" />
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
