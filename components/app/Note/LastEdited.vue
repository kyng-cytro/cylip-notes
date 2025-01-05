<script setup lang="ts">
const { formatToTimeAgo } = useDateUtils();
defineProps<{
  trashed?: boolean;
  label: Label | null;
  updatedAt: string;
  reminderAt: string | null;
}>();
</script>
<template>
  <p
    class="flex items-center space-x-2 whitespace-nowrap text-sm font-medium leading-none"
  >
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
