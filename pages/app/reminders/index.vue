<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { initialized } = storeToRefs(notesStore);
const { containerParentStyles: layoutStyles } = useLayout();

const notes = computed(() => {
  return notesStore.methods.retrieveNotes("reminders");
});
</script>
<template>
  <AppMainContainer>
    <template v-if="!notes.length">
      <AppEmptyPage
        title="No reminders yet"
        subtitle="Note with reminders will appear here"
        v-if="initialized"
      />
      <AppScrollContainer v-else :class="layoutStyles">
        <AppNotesLoading />
      </AppScrollContainer>
    </template>
    <template v-else>
      <AppScrollContainer :class="layoutStyles">
        <p class="text-sm font-semibold text-muted-foreground">Reminders</p>
        <AppNoteContainer v-model:notes="notes" :disabled="true" />
      </AppScrollContainer>
    </template>
    <PlusModalPage name="modal" />
  </AppMainContainer>
</template>
