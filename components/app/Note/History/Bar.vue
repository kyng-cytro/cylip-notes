<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { ChevronDown, X } from "lucide-vue-next";

const { noteId, editor } = defineProps<{
  noteId: string;
  editor: Editor;
  canRestore: boolean;
}>();

const { versions, selected, load, select, restore, close } =
  useNoteHistory(noteId);
const { formatVersionDate } = useVersionDate();
const restoring = ref(false);

const selectedVersion = computed(() =>
  versions.value.find((version) => version.id === selected.value?.id),
);

const onRestore = async () => {
  restoring.value = true;
  try {
    await restore(editor);
  } finally {
    restoring.value = false;
  }
};

onMounted(load);
</script>

<template>
  <div
    class="flex min-h-7 items-center gap-4 px-2 text-sm leading-none font-medium"
  >
    <TooltipWrapper tooltip="Back to note">
      <button type="button" @click="close">
        <X class="size-4" />
        <span class="sr-only">Back to note</span>
      </button>
    </TooltipWrapper>
    <Button
      v-if="canRestore && selectedVersion && !selectedVersion.current"
      size="xs"
      :disabled="restoring"
      @click="onRestore"
    >
      Restore
    </Button>
    <div class="ml-auto min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button type="button" class="flex min-w-0 flex-col items-start gap-1">
            <span class="flex items-center gap-1">
              {{
                selectedVersion
                  ? formatVersionDate(selectedVersion)
                  : "Loading..."
              }}
              <ChevronDown class="size-4" />
            </span>
            <span
              v-if="selectedVersion?.editors.length"
              class="text-muted-foreground max-w-full truncate text-xs font-normal"
            >
              {{ selectedVersion.editors.join(", ") }}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-60">
          <DropdownMenuItem
            v-for="version in versions"
            :key="version.id"
            :disabled="!version.available"
            class="flex items-start justify-between gap-2"
            @click="select(version.id)"
          >
            <div class="min-w-0">
              <p :class="{ 'font-semibold': version.id === selected?.id }">
                {{ formatVersionDate(version) }}
              </p>
              <p
                v-if="version.editors.length"
                class="text-muted-foreground truncate text-xs"
              >
                {{ version.editors.join(", ") }}
              </p>
            </div>
            <Badge v-if="!version.available" class="rounded-full px-1.5"
              >Pro</Badge
            >
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
