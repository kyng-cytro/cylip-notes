<script setup lang="ts">
import {
  CloudAlert,
  CloudOff,
  FingerprintPattern,
  RotateCw,
} from "lucide-vue-next";
import { UNTITLED_NOTE } from "@/constants";
import { toast } from "vue-sonner";

const noteStore = useNoteStore();
const { status, blockedNotes } = storeToRefs(noteStore);
const { formatToTimeAgo } = useDateUtils();

const blocked = computed(
  () => status.value !== "offline" && blockedNotes.value.length > 0,
);

const tooltip = computed(() => {
  if (blocked.value) {
    return "Some notes have changes waiting to sync";
  }
  return {
    offline: "Offline: changes are saved on this device",
    syncing: "Syncing...",
    synced: "All changes synced",
  }[status.value];
});

const rows = computed(() =>
  blockedNotes.value.map((blockedNote) => ({
    ...blockedNote,
    note: noteStore.getNoteById(blockedNote.noteId),
  })),
);

const savedNoteIds = computed(() =>
  blockedNotes.value
    .map(({ noteId }) => noteId)
    .filter(noteStore.hasSavedPassword),
);

const listOpen = ref(false);
const approving = ref<string | null>(null);
const discarding = ref<string | null>(null);
const unlockingAll = ref(false);

const approve = async (noteId: string) => {
  listOpen.value = false;
  if (await noteStore.tryPasskeyUnlock(noteId)) return;
  approving.value = noteId;
};

const confirmDiscard = (noteId: string) => {
  listOpen.value = false;
  discarding.value = noteId;
};

const discard = async () => {
  await noteStore.discardLocalChanges(discarding.value!);
  discarding.value = null;
  toast.success("Changes discarded.");
};

const unlockAll = async () => {
  unlockingAll.value = true;
  try {
    await noteStore.unlockWithPasskey(savedNoteIds.value);
  } catch (e: any) {
    toast.error("Couldn't unlock every note.", {
      description: e.data?.message ?? e.message,
    });
  } finally {
    unlockingAll.value = false;
  }
};
</script>
<template>
  <TooltipWrapper v-if="blocked" :tooltip="tooltip">
    <Popover v-model:open="listOpen">
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="relative bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300"
        >
          <CloudAlert class="size-4" />
          <span
            class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white"
          >
            {{ blockedNotes.length }}
          </span>
          <span class="sr-only">{{ tooltip }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" class="w-80 p-0">
        <div class="flex items-center justify-between gap-2 border-b p-3">
          <div>
            <p class="text-sm font-semibold">Waiting to sync</p>
            <p class="text-muted-foreground text-xs">
              Unlock these notes to sync the changes made on this device.
            </p>
          </div>
          <Button
            v-if="savedNoteIds.length"
            size="xs"
            :loading="unlockingAll"
            @click="unlockAll"
          >
            <FingerprintPattern class="size-3.5" />
            Unlock all
          </Button>
        </div>
        <ul class="max-h-80 divide-y overflow-y-auto">
          <li
            v-for="row in rows"
            :key="row.noteId"
            class="flex items-center justify-between gap-3 px-3 py-2"
          >
            <div class="min-w-0 space-y-0.5">
              <p class="truncate text-sm font-medium">
                {{ row.note?.title || UNTITLED_NOTE }}
              </p>
              <p class="text-muted-foreground truncate text-xs">
                <template v-if="row.note">
                  {{ formatToTimeAgo(row.note.updatedAt, { sentence: true }) }}
                  ·
                </template>
                <span class="font-mono text-emerald-600">+{{ row.added }}</span>
                <span class="font-mono text-red-600"> −{{ row.removed }}</span>
              </p>
            </div>
            <div class="flex shrink-0 gap-1">
              <Button size="xs" variant="ghost" @click="approve(row.noteId)">
                Approve
              </Button>
              <Button
                size="xs"
                variant="ghost"
                class="text-red-600"
                @click="confirmDiscard(row.noteId)"
              >
                Discard
              </Button>
            </div>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  </TooltipWrapper>
  <TooltipWrapper v-else :tooltip="tooltip">
    <Button
      variant="ghost"
      size="icon"
      :class="{ 'text-muted-foreground': status === 'synced' }"
      @click="noteStore.syncNow()"
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
  <Dialog
    :open="!!approving"
    @update:open="(open) => !open && (approving = null)"
  >
    <DialogContent class="sm:max-w-[425px]">
      <AppHeaderApproveNote
        v-if="approving"
        :note-id="approving"
        @unlocked="approving = null"
      />
    </DialogContent>
  </Dialog>
  <AppConfirmDialog
    :open="!!discarding"
    @update:open="(open) => !open && (discarding = null)"
    title="Discard changes?"
    description="The edits made on this device that haven't synced will be deleted. This can't be undone."
    :buttons="{
      confirm: { text: 'Discard' },
      cancel: { text: 'Keep' },
    }"
    @confirm="discard"
  />
</template>
