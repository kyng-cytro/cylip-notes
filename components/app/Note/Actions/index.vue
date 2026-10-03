<script setup lang="ts">
import type { ClientNote } from "@/lib/types";
import type { Editor } from "@tiptap/vue-3";
import { ArchiveIcon, Repeat2Icon, Trash2Icon } from "lucide-vue-next";

const props = defineProps<{
  note: ClientNote;
  editor?: Editor;
  canOpen?: boolean;
  cb?: () => void;
}>();

const { methods } = useNoteStore();
const { copy } = useCustomClipboard();

const isOwner = computed(() => props.note.role === "owner");
const canEdit = computed(() => props.note.role !== "viewer");

const runAndClose = async (action: () => void | Promise<void>) => {
  await action();
  props.cb?.();
};

const removeNote = () =>
  isOwner.value
    ? methods.toggleNoteProp(props.note, "trashed")
    : methods.deleteNoteForever(props.note);
</script>

<template>
  <template v-if="note.trashed">
    <AppNoteActionsButton
      tooltip="Restore note"
      :icon="Repeat2Icon"
      @button-click="runAndClose(() => methods.toggleNoteProp(note, 'trashed'))"
    />
    <TooltipWrapper tooltip="Delete forever">
      <AppConfirmDialog
        title="Delete forever"
        description="This action cannot be undone. Are you sure you want to delete this note forever?"
        :buttons="{
          confirm: { text: 'Delete forever' },
          cancel: { text: 'Cancel' },
        }"
        @confirm="runAndClose(() => methods.deleteNoteForever(note))"
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
      @set-reminder="methods.setReminder(note.id, $event)"
    />
    <AppNoteActionsShare :note="note" />
    <AppNoteActionsBackgroundOptions
      v-if="canEdit"
      :background="note.background"
      @set-background="methods.setBackground(note, $event)"
    />
    <AppNoteActionsButton
      :tooltip="note.archived ? 'Unarchive' : 'Archive'"
      :icon="ArchiveIcon"
      @button-click="
        runAndClose(() => methods.toggleNoteProp(note, 'archived'))
      "
    />
    <AppNoteActionsDropdown
      :can-open="canOpen"
      :label-id="note.labelId"
      :delete-text="isOwner ? 'Delete Note' : 'Leave Note'"
      @copy="copy(editor?.getHTML(), true)"
      @delete="runAndClose(removeNote)"
      @full-screen="navigateTo(`/app/notes/${note.id}`, { external: true })"
      @assign-label="methods.assignLabel(note, $event)"
      @toggle-show-preview="methods.toggleNoteProp(note, 'preview')"
    />
  </template>
</template>
