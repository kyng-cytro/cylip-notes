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

const closeAfter =
  (action: (password: string) => Promise<void>) => async (password: string) => {
    await action(password);
    open.value = false;
  };

const unlock = closeAfter((password) =>
  noteStore.unlockNote(props.note.id, password),
);

const setPassword = closeAfter((password) =>
  noteStore.lockNote(props.note.id, password),
);

const removeLock = async () => {
  await noteStore.removeNoteLock(props.note.id);
  open.value = false;
};
</script>

<template>
  <TooltipWrapper :tooltip="tooltip">
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button variant="ghost" size="xs">
          <LockKeyhole class="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <template v-if="note.locked">
          <DialogTitle class="sr-only">Unlock note</DialogTitle>
          <AppNoteUnlock :unlock :reset="setPassword" />
        </template>
        <template v-else>
          <DialogHeader>
            <DialogTitle>
              {{ note.lockedAt ? "Change password" : "Lock note" }}
            </DialogTitle>
            <DialogDescription>
              Everyone opening this note, including you and the people it's
              shared with, will need this password.
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
  </TooltipWrapper>
</template>
