<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { initialized } = storeToRefs(notesStore);
const { containerParentStyles: layoutStyles } = useLayout();

const notes = computed(() => {
  return notesStore.methods.retrieveNotes("archived");
});
</script>
<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <template v-if="!notes.length">
      <AppEmptyPage
        title="No archived notes yet"
        subtitle="Archived notes will appear here"
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
        <p class="text-sm font-semibold text-muted-foreground">Archived</p>

        <AppNoteContainer v-model:notes="notes" :disabled="true" />
      </div>
    </template>
  </main>
</template>
