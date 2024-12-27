<script setup lang="ts">
import type { Note } from "@/server/utils/drizzle";

const props = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();
const { layout } = storeToRefs(useLayoutStore());
const { convertToHtml } = useEditorUtils();

const openModal = () => {
  useModalRouter().push(`/app/notes/${props.note.id}`);
};

const content = computed(() => {
  return convertToHtml(props.note.content);
});
</script>
<template>
  <Card
    tabindex="0"
    class="group mb-2 flex w-full cursor-pointer break-inside-avoid flex-col gap-3 rounded-lg p-4 ring-blue-500 focus:outline-none focus:ring-2"
    :class="{
      'max-w-none': layout === 'list',
    }"
    @click="openModal"
  >
    <!-- Header -->
    <div v-if="note.title">
      <CardTitle class="line-clamp-2 font-semibold leading-snug">{{
        note.title
      }}</CardTitle>
    </div>
    <!-- Content -->
    <div
      class="line-clamp-[18] max-h-96 overflow-hidden"
      v-if="note.showPreview && content"
    >
      <p
        v-html="content"
        class="tiptap prose pointer-events-none relative max-w-none flex-1 text-sm dark:prose-invert"
      />
    </div>
    <!-- Label & Reminder -->
    <div
      class="mt-3 flex items-center gap-4 text-muted-foreground"
      v-if="note.label"
    >
      <Badge class="text-xs capitalize" v-if="note.label">
        {{ note.label.name }}
      </Badge>
    </div>
    <!-- Actions -->
    <div
      class="invisible flex items-center justify-end gap-4 text-muted-foreground group-hover:visible group-focus:visible"
    >
      <template v-if="note.trashed">
        <AppNoteActionsTrashed
          @restore="noteStore.methods.toggleNoteProp(note, 'trashed')"
          @delete-forever="noteStore.methods.permenentlyDeleteNote(note)"
        />
      </template>
      <template v-else>
        <AppNoteActionsPin
          :pinned="note.pinned"
          @toggle-pinned="noteStore.methods.toggleNoteProp(note, 'pinned')"
        />
        <AppNoteActionsDropdown
          :label-id="note.labelId"
          v-if="!note.archived"
          @delete="noteStore.methods.toggleNoteProp(note, 'trashed')"
          @archive="noteStore.methods.toggleNoteProp(note, 'archived')"
          @assign-label="
            (labelId) => noteStore.methods.assignLabel(note, labelId)
          "
          @toggle-show-preview="
            noteStore.methods.toggleNoteProp(note, 'showPreview')
          "
        />
        <template v-if="note.archived">
          <AppNoteActionsArchived
            @unarchive="noteStore.methods.toggleNoteProp(note, 'archived')"
          />
        </template>
      </template>
    </div>
  </Card>
</template>
