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
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-muted-foreground">
            Notes will be deleted permanently after 7 days.
          </p>
          <AppConfirmDialog
            title="Delete all trashed notes"
            description="This action cannot be undone. Are you sure you want to delete all trashed notes?"
            :buttons="{
              confirm: { text: 'Delete trashed notes' },
              cancel: { text: 'Cancel' },
            }"
            @confirm="() => notesStore.methods.clearTrash()"
          >
            <Button
              variant="ghost"
              class="text-sm font-semibold text-muted-foreground"
            >
              Clear
            </Button>
          </AppConfirmDialog>
        </div>
        <AppNoteContainer v-model:notes="notes" :disabled="true" />
      </AppScrollContainer>
    </template>
    <PlusModalPage name="modal" />
  </AppMainContainer>
</template>
