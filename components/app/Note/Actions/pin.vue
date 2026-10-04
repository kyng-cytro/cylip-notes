<script setup lang="ts">
import { Pin, PinOff } from "lucide-vue-next";
defineProps<{
  pinned: boolean;
}>();

defineEmits<{
  (e: "toggle-pinned"): void;
}>();
</script>

<template>
  <TooltipWrapper :tooltip="pinned ? 'Unpin note' : 'Pin note'">
    <Button variant="ghost" size="icon" @click.stop="$emit('toggle-pinned')">
      <PinOff v-if="pinned" class="size-5 rotate-45" />
      <Pin v-else class="size-5 rotate-45" />
      <span class="sr-only">{{ pinned ? "Unpin note" : "Pin note" }}</span>
    </Button>
  </TooltipWrapper>
</template>
