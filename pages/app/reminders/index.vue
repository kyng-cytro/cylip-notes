<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { caughtUp } = storeToRefs(notesStore);
const { containerParentStyles: layoutStyles } = useNoteLayout();

const notes = computed(() => {
  return notesStore.retrieveNotes("reminders");
});
</script>
<template>
  <AppMainContainer>
    <template v-if="!notes.length">
      <AppEmptyPage
        title="No reminders yet"
        subtitle="Note with reminders will appear here"
        v-if="caughtUp"
      />
      <AppScrollContainer v-else :class="layoutStyles">
        <AppNotesLoading />
      </AppScrollContainer>
    </template>
    <template v-else>
      <AppScrollContainer :class="layoutStyles">
        <p class="text-muted-foreground text-sm font-semibold">Reminders</p>
        <AppNoteContainer :notes="notes" :disabled="true" />
      </AppScrollContainer>
    </template>
    <PlusModalPage name="modal" />
  </AppMainContainer>
</template>
