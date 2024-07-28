<script setup lang="ts">
import { Trash2, Repeat2 } from "lucide-vue-next";

defineEmits<{
  (e: "delete-forever"): void;
  (e: "restore"): void;
}>();
</script>
<template>
  <div
    @click.stop
    class="invisible flex items-center pb-2.5 text-muted-foreground group-hover:visible group-focus:visible"
  >
    <TooltipWrapper tooltip="Delete Forever" @click="$emit('delete-forever')">
      <Button variant="ghost" size="icon">
        <Trash2 class="h-4 w-4" />
        <span class="sr-only">Delete Forever</span>
      </Button>
    </TooltipWrapper>
    <TooltipWrapper tooltip="Restore" @click="$emit('restore')">
      <Button variant="ghost" size="icon">
        <Repeat2 class="h-4 w-4" />
        <span class="sr-only">Restore</span>
      </Button>
    </TooltipWrapper>
  </div>
</template>
