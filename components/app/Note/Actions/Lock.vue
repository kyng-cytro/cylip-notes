<script setup lang="ts">
import type { ClientNote } from "@/lib/types";
import { LockKeyhole } from "lucide-vue-next";

const props = defineProps<{ note: ClientNote }>();

const noteStore = useNoteStore();
const open = ref(false);

const tooltip = computed(() => {
  if (props.note.locked) return "Unlock note";
  return props.note.lockedAt ? "Lock settings" : "Lock note";
});

const { unlock, passkey, remember } = useNoteUnlock(() => props.note.id, {
  onUnlocked: () => (open.value = false),
});

const setPassword = async (password: string) => {
  await noteStore.lockNote(props.note.id, password);
  open.value = false;
};

const openLock = async () => {
  if (await noteStore.tryPasskeyUnlock(props.note.id)) return;
  open.value = true;
};

const removeLock = async () => {
  await noteStore.removeNoteLock(props.note.id);
  open.value = false;
};
</script>

<template>
  <TooltipWrapper :tooltip="tooltip">
    <Button variant="ghost" size="xs" @click="openLock">
      <LockKeyhole class="size-4" />
    </Button>
  </TooltipWrapper>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[425px]">
      <template v-if="note.locked">
        <DialogTitle class="sr-only">Unlock note</DialogTitle>
        <AppNoteUnlock
          :unlock
          :passkey
          v-model:remember="remember"
          :reset="setPassword"
        />
      </template>
      <template v-else>
        <DialogHeader>
          <DialogTitle>
            {{ note.lockedAt ? "Change password" : "Lock note" }}
          </DialogTitle>
          <DialogDescription>
            Everyone opening this note, including you and the people it's shared
            with, will need this password.
          </DialogDescription>
        </DialogHeader>
        <AppNotePasswordForm
          mode="set"
          :submit-text="note.lockedAt ? 'Change password' : 'Lock note'"
          :submit="setPassword"
        />
        <Button
          v-if="note.lockedAt"
          variant="ghost"
          class="text-red-600"
          @click="removeLock"
        >
          Remove lock
        </Button>
      </template>
    </DialogContent>
  </Dialog>
</template>
