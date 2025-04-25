<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import {
  ArchiveIcon,
  Repeat2Icon,
  Share2Icon,
  Trash2Icon,
} from "lucide-vue-next";

const props = defineProps<{
  note: Note;
  editor?: Editor;
  canOpen?: boolean;
  cb?: () => void;
  refresh?: () => void;
}>();

const noteStore = useNoteStore();

const { copy } = useCustomClipboard();

const runWithCallback = async (action: () => Promise<void>) => {
  await action();
  if (props.cb) props.cb();
};

const runWithRefresh = async (action: () => Promise<void>) => {
  await action();
  if (props.refresh) props.refresh();
};
</script>

<template>
  <template v-if="note.trashed">
    <AppNoteActionsButton
      tooltip="Restore note"
      :icon="Repeat2Icon"
      @button-click="
        runWithCallback(() => noteStore.methods.toggleNoteProp(note, 'trashed'))
      "
    />
    <TooltipWrapper tooltip="Delete forever">
      <AppConfirmDialog
        title="Delete forever"
        description="This action cannot be undone. Are you sure you want to delete this note forever?"
        :buttons="{
          confirm: { text: 'Delete forever' },
          cancel: { text: 'Cancel' },
        }"
        @confirm="
          runWithCallback(() => noteStore.methods.permenentlyDeleteNote(note))
        "
      >
        <Button variant="ghost" size="xs">
          <Trash2Icon class="size-4" />
        </Button>
      </AppConfirmDialog>
    </TooltipWrapper>
  </template>
  <template v-else>
    <AppNoteActionsReminder
      :reminder-at="note.reminderAt"
      @set-reminder="
        runWithRefresh(() => noteStore.methods.setReminder(note, $event))
      "
    />
    <AppNoteActionsShare
      :note-id="note.id"
      :public="note.options?.public"
      @set-public="
        runWithRefresh(() => noteStore.methods.toggleNoteProp(note, 'public'))
      "
    />
    <AppNoteActionsBackgroundOptions
      :background="note.options?.background"
      @set-background="
        runWithRefresh(() => noteStore.methods.setBackground(note, $event))
      "
    />
    <AppNoteActionsButton
      :tooltip="note.archived ? 'Unarchive' : 'Archive'"
      :icon="ArchiveIcon"
      @button-click="
        runWithCallback(() =>
          noteStore.methods.toggleNoteProp(note, 'archived'),
        )
      "
    />
    <AppNoteActionsDropdown
      :can-open="canOpen"
      :label-id="note.labelId"
      @copy="() => copy(editor?.getHTML(), true)"
      @delete="
        runWithCallback(() => noteStore.methods.toggleNoteProp(note, 'trashed'))
      "
      @full-screen="navigateTo(`/app/notes/${note.id}`, { external: true })"
      @assign-label="
        (labelId: string | null) =>
          runWithRefresh(() => noteStore.methods.assignLabel(note, labelId))
      "
      @toggle-show-preview="
        runWithRefresh(() => noteStore.methods.toggleNoteProp(note, 'preview'))
      "
    />
  </template>
</template>
