<script setup lang="ts">
import { isSharedNote } from "@/lib/notes";
import type { ClientNote } from "@/lib/types";

const { formatToTimeAgo } = useDateUtils();
defineProps<{ note: ClientNote }>();
</script>
<template>
  <p
    class="flex items-center space-x-2 text-sm leading-none font-medium whitespace-nowrap"
  >
    <template v-if="note.public">
      <AppNoteActionsShareBadge />
      <span>•</span>
    </template>
    <template v-if="isSharedNote(note)">
      <AppNoteSharedBadge :note="note" />
      <span>•</span>
    </template>
    <template v-if="note.reminderAt">
      <AppNoteActionsReminderBadge :date="note.reminderAt" no-clear />
      <span>•</span>
    </template>
    <template v-if="note.label">
      <AppLabelDisplay :name="note.label.name" />
      <span>•</span>
    </template>
    <template v-if="note.trashed">
      <span>Note in Trash</span>
      <span>•</span>
    </template>
    <span>⏳ {{ formatToTimeAgo(note.updatedAt || note.createdAt) }} </span>
  </p>
</template>
