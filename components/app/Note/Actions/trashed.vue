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
  <div @click.stop>
    <TooltipWrapper tooltip="Delete forever">
      <AppConfirmDialog
        title="Delete forever"
        description="This action cannot be undone. Are you sure you want to delete this note forever?"
        :buttons="{
          confirm: { text: 'Delete forever' },
          cancel: { text: 'Cancel' },
        }"
        @confirm="$emit('delete-forever')"
      >
        <Button variant="ghost" size="icon">
          <Trash2 class="size-5" />
        </Button>
      </AppConfirmDialog>
    </TooltipWrapper>
  </div>
</template>
