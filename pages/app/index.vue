<script setup lang="ts">
import { Plus } from "lucide-vue-next";
definePageMeta({
  layout: "app",
});

const notesStore = useNoteStore();
const { initialized } = storeToRefs(notesStore);
const { label } = storeToRefs(useLayoutStore());
const { containerParentStyles: layoutStyles } = useNoteLayout();

const notes = computed(() => {
  return notesStore.methods.retrieveNotes("active", label.value);
});

const pinnedNotes = computed(() => {
  return notesStore.methods.retrieveNotes("pinned", label.value);
});

const createNote = () => notesStore.methods.createNote(label.value);

const moveNote = (
  noteId: string,
  beforeId: string | null,
  afterId: string | null,
) => notesStore.methods.moveNote(noteId, label.value, beforeId, afterId);
</script>

<template>
  <AppMainContainer>
    <div class="flex items-center justify-between pr-2 pl-1">
      <AppLabelSelect />
      <Button class="font-semibold" variant="default" @click="createNote">
        New Note <Plus class="ml-1 size-5" />
        <span class="sr-only">Create new note</span>
      </Button>
    </div>
    <template v-if="!notes.length && !pinnedNotes.length">
      <AppEmptyPage
        :title="
          label === 'all-notes' ? 'No notes yet' : 'No notes in this label'
        "
        :subtitle="
          label === 'all-notes'
            ? 'Create your first note to get started'
            : 'Notes with this label will show up here.'
        "
        :button="label === 'all-notes' ? { text: 'Create Note' } : undefined"
        @button-click="createNote"
        v-if="initialized"
      />
      <AppScrollContainer v-else :class="layoutStyles">
        <AppNotesLoading />
      </AppScrollContainer>
    </template>
    <template v-else>
      <AppScrollContainer :class="layoutStyles">
        <p
          class="text-muted-foreground text-sm font-semibold"
          v-if="pinnedNotes.length"
        >
          Pinned
        </p>
        <AppNoteContainer
          :notes="pinnedNotes"
          v-if="pinnedNotes.length"
          @move="moveNote"
        />
        <p
          class="text-muted-foreground text-sm font-semibold"
          v-if="pinnedNotes.length"
        >
          Others
        </p>
        <AppNoteContainer :notes="notes" @move="moveNote" />
      </AppScrollContainer>
    </template>
    <PlusModalPage name="modal" />
  </AppMainContainer>
</template>
