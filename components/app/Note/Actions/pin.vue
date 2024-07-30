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
  <TooltipWrapper tooltip="Pin note">
    <Button variant="ghost" size="icon" @click.stop="$emit('toggle-pinned')">
      <template v-if="pinned">
        <PinOff class="size-5 rotate-45" />
        <span class="sr-only">Pin note</span>
      </template>
      <template v-else>
        <Pin class="size-5 rotate-45" />
        <span class="sr-only">Unpin note</span>
      </template>
    </Button>
  </TooltipWrapper>
</template>
