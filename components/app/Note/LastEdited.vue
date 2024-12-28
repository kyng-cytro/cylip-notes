<script setup lang="ts">
const { formatToTimeAgo } = useDateUtils();
defineProps<{
  trashed?: boolean;
  updatedAt: string;
}>();
</script>
<template>
  <p class="space-x-2 whitespace-nowrap text-sm font-medium leading-none">
    <template v-if="trashed">
      <span>Note in Trash</span>
      <span>•</span>
    </template>
    <span>⏳ {{ formatToTimeAgo(updatedAt) }} </span>
  </p>
</template>
