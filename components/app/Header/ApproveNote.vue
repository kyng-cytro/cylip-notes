<script setup lang="ts">
import { UNTITLED_NOTE } from "@/constants";

const props = defineProps<{ noteId: string }>();
const emit = defineEmits<{ (e: "unlocked"): void }>();

const noteStore = useNoteStore();
const note = computed(() => noteStore.getNoteById(props.noteId));
const { unlock, passkey, remember } = useNoteUnlock(() => props.noteId, {
  onUnlocked: () => emit("unlocked"),
});
</script>

<template>
  <DialogTitle class="truncate pr-6">
    {{ note?.title || UNTITLED_NOTE }}
  </DialogTitle>
  <DialogDescription>
    Unlock this note to sync the changes made on this device.
  </DialogDescription>
  <AppNoteUnlock :unlock :passkey v-model:remember="remember" />
</template>
