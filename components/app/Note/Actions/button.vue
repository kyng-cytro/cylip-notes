<script setup lang="ts">
defineProps<{
  tooltip: string;
  icon: Component;
  disabled?: boolean;
}>();
</script>
<template>
  <TooltipWrapper :tooltip>
    <Button :disabled size="xs" variant="ghost" @click="$emit('button-click')">
      <component :is="icon" class="size-4" />
    </Button>
  </TooltipWrapper>
</template>
