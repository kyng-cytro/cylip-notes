<script setup lang="ts">
import { Repeat2, Trash2 } from "lucide-vue-next";
defineEmits<{
  (e: "restore"): void;
  (e: "delete-forever"): void;
}>();
</script>
<template>
  <TooltipWrapper tooltip="Restore note">
    <Button variant="ghost" size="icon" @click.stop="$emit('restore')">
      <Repeat2 class="size-5" />
    </Button>
  </TooltipWrapper>
  <!-- TODO: implement delete permanently -->
  <TooltipWrapper tooltip="Delete permanently">
    <Button variant="ghost" size="icon" @click.stop="$emit('delete-forever')">
      <Trash2 class="size-5" />
    </Button>
  </TooltipWrapper>
</template>
