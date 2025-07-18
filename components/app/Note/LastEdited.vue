<script setup lang="ts">
import type { NoteOptions } from "@/schemas/note";

const { formatToTimeAgo } = useDateUtils();
defineProps<{
  trashed?: boolean;
  updatedAt: string;
  label: Label | null;
  reminderAt: string | null;
  public?: NoteOptions["public"];
}>();
</script>
<template>
  <p
    class="flex items-center space-x-2 whitespace-nowrap text-sm font-medium leading-none"
  >
    <template v-if="public?.enabled">
      <AppNoteActionsShareBadge :vists="public.vists" />
      <span>•</span>
    </template>
    <template v-if="reminderAt">
      <AppNoteActionsReminderBadge :date="reminderAt" no-clear />
      <span>•</span>
    </template>
    <template v-if="label">
      <AppLabelDisplay :name="label.name" />
      <span>•</span>
    </template>
    <template v-if="trashed">
      <span>Note in Trash</span>
      <span>•</span>
    </template>
    <span>⏳ {{ formatToTimeAgo(updatedAt) }} </span>
  </p>
</template>
