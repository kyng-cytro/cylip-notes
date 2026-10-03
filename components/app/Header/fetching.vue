<script setup lang="ts">
import { CloudOff, RotateCw } from "lucide-vue-next";

const noteStore = useNoteStore();
const { status } = storeToRefs(noteStore);

const tooltip = computed(
  () =>
    ({
      offline: "Offline: changes are saved on this device",
      syncing: "Syncing...",
      synced: "All changes synced",
    })[status.value],
);
</script>
<template>
  <TooltipWrapper :tooltip="tooltip">
    <Button
      variant="ghost"
      size="icon"
      :class="{ 'text-muted-foreground': status === 'synced' }"
      @click="noteStore.methods.syncNow()"
    >
      <CloudOff v-if="status === 'offline'" class="size-4" />
      <RotateCw
        v-else
        class="size-4"
        :class="{ 'animate-spin': status === 'syncing' }"
      />
      <span class="sr-only">{{ tooltip }}</span>
    </Button>
  </TooltipWrapper>
</template>
