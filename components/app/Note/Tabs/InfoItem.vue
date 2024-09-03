<script setup lang="ts">
defineProps<{
  title: string;
  value?: string | null;
  customValue?: boolean;
  emptyPlaceholder?: string;
}>();
</script>
<template>
  <div class="space-y-1">
    <p class="text-sm font-semibold text-muted-foreground">{{ title }}</p>
    <p v-if="!customValue">{{ value || emptyPlaceholder || "N/A" }}</p>
    <slot v-else />
  </div>
</template>
