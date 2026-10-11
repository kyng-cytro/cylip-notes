<script setup lang="ts">
import { CloudOff, RotateCw } from "lucide-vue-next";

const noteStore = useNoteStore();
const { status, blockedNoteIds } = storeToRefs(noteStore);

const blocked = computed(
  () => status.value !== "offline" && blockedNoteIds.value.length > 0,
);

const tooltip = computed(() => {
  if (blocked.value) {
    return "Offline sync for some notes is blocked and needs your attention";
  }
  return {
    offline: "Offline: changes are saved on this device",
    syncing: "Syncing...",
    synced: "All changes synced",
  }[status.value];
});

const onClick = () => {
  if (!blocked.value) return noteStore.syncNow();
  useModalRouter().push(`/app/notes/${blockedNoteIds.value[0]}`);
};
</script>
<template>
  <TooltipWrapper :tooltip="tooltip">
    <Button
      variant="ghost"
      size="icon"
      class="relative"
      :class="{
        'text-muted-foreground': status === 'synced' && !blocked,
        'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300':
          blocked,
      }"
      @click="onClick"
    >
      <CloudOff v-if="status === 'offline'" class="size-4" />
      <RotateCw
        v-else
        class="size-4"
        :class="{ 'animate-spin': status === 'syncing' }"
      />
      <span
        v-if="blocked"
        class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white"
      >
        {{ blockedNoteIds.length }}
      </span>
      <span class="sr-only">{{ tooltip }}</span>
    </Button>
  </TooltipWrapper>
</template>
