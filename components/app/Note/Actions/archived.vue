<script setup lang="ts">
import { ArchiveX } from "lucide-vue-next";
defineEmits<{
  (e: "unarchive"): void;
}>();
</script>
<template>
  <TooltipWrapper tooltip="Unarchive note">
    <Button variant="ghost" size="icon" @click.stop="$emit('unarchive')">
      <ArchiveX class="size-5" />
    </Button>
  </TooltipWrapper>
</template>
