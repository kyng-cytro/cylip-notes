<script setup lang="ts">
import { Button } from "@/components/ui/button";
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
