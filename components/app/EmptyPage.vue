<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  button?: {
    text: string;
    to?: string;
  };
}>();

defineEmits<{
  (e: "buttonClick"): void;
}>();
</script>
<template>
  <div
    class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
  >
    <div class="flex flex-col items-center gap-1 text-center">
      <h3 class="text-2xl font-bold tracking-tight">{{ title }}</h3>
      <p class="text-sm text-muted-foreground">
        {{ subtitle }}
      </p>
      <Button
        v-if="button"
        class="mt-4"
        :to="button.to"
        @click="$emit('buttonClick')"
      >
        {{ button.text }}
      </Button>
    </div>
  </div>
</template>
