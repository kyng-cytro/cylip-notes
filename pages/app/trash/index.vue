<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { initialized } = storeToRefs(notesStore);
const { containerParentStyles: layoutStyles } = useLayout();

const notes = computed(() => {
  return notesStore.methods.retrieveNotes("trashed");
});
</script>
<template>
  <AppMainContainer>
    <template v-if="!notes.length">
      <AppEmptyPage
        title="No trashed notes yet"
        subtitle="Trashed notes will appear here"
        v-if="initialized"
      />
      <AppScrollContainer v-else :class="layoutStyles">
        <AppNotesLoading />
      </AppScrollContainer>
    </template>
    <template v-else>
      <AppScrollContainer :class="layoutStyles">
        <p class="text-sm font-semibold text-muted-foreground">
          Notes will be deleted permanently after 7 days.
        </p>
        <AppNoteContainer v-model:notes="notes" :disabled="true" />
      </AppScrollContainer>
    </template>
    <Transition name="modal">
      <PlusModalPage name="modal" />
    </Transition>
  </AppMainContainer>
</template>
