<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { caughtUp } = storeToRefs(notesStore);
const { containerParentStyles: layoutStyles } = useNoteLayout();

const notes = computed(() => {
  return notesStore.retrieveNotes("trashed");
});
</script>
<template>
  <AppMainContainer>
    <template v-if="!notes.length">
      <AppEmptyPage
        title="No trashed notes yet"
        subtitle="Trashed notes will appear here"
        v-if="caughtUp"
      />
      <AppScrollContainer v-else :class="layoutStyles">
        <AppNotesLoading />
      </AppScrollContainer>
    </template>
    <template v-else>
      <AppScrollContainer :class="layoutStyles">
        <div class="flex flex-wrap items-center justify-between gap-y-2">
          <p class="text-muted-foreground text-sm font-semibold">
            Notes will be deleted permanently after 7 days.
          </p>
          <AppConfirmDialog
            title="Delete all trashed notes"
            description="This action cannot be undone. Are you sure you want to delete all trashed notes?"
            :buttons="{
              confirm: { text: 'Delete trashed notes' },
              cancel: { text: 'Cancel' },
            }"
            @confirm="() => notesStore.clearTrash()"
          >
            <Button
              variant="link"
              class="text-muted-foreground p-0 text-sm font-semibold"
            >
              Empty Trash
            </Button>
          </AppConfirmDialog>
        </div>
        <AppNoteContainer :notes="notes" :disabled="true" />
      </AppScrollContainer>
    </template>
    <PlusModalPage name="modal" />
  </AppMainContainer>
</template>
