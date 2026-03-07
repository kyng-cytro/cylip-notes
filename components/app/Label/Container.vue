<script setup lang="ts">
import type { ClientLabel } from "@/lib/types";
import { GripVertical, PencilIcon, TagIcon, Trash2Icon } from "lucide-vue-next";
import { VueDraggableNext } from "vue-draggable-next";

const props = defineProps<{
  labels: ClientLabel[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "delete", label: ClientLabel): void;
  (e: "reorder", orderedIds: string[]): void;
}>();

const dragOptions = computed(() => ({
  disabled: props.disabled,
  animation: 200,
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: "ghost",
  chosenClass: "chosen",
  dragClass: "dragging",
  handle: ".drag-handle",
}));

const drag = ref(false);
const localLabels = ref<ClientLabel[]>([]);
const { vibrate, isSupported } = useVibrate();

const dragStart = () => {
  if (isSupported.value) vibrate(1);
  drag.value = true;
};

const dragEnd = () => {
  drag.value = false;
  emit(
    "reorder",
    localLabels.value.map((label) => label.id),
  );
};

const getBackgroundLabel = (label: ClientLabel) => {
  const background = label.options?.background;
  if (!background?.value) return "No background";
  return capitalize(background.value);
};

watch(
  () => props.labels,
  (value) => {
    if (drag.value) return;
    localLabels.value = [...value];
  },
  { immediate: true },
);
</script>

<template>
  <div class="space-y-3">
    <p v-if="!localLabels.length" class="text-muted-foreground text-sm">
      No labels yet. Create one to get started.
    </p>
    <VueDraggableNext
      v-else
      v-model="localLabels"
      v-bind="dragOptions"
      class="space-y-2"
      @start="dragStart"
      @end="dragEnd"
    >
      <div
        v-for="label in localLabels"
        :key="label.id"
        class="bg-card flex items-center justify-between gap-4 rounded-lg border p-3"
      >
        <div class="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            class="drag-handle text-muted-foreground hover:text-foreground size-8 cursor-grab"
          >
            <GripVertical class="size-4" />
          </Button>
          <div class="min-w-0 space-y-2">
            <p class="truncate font-semibold capitalize">
              {{ label.name }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" class="capitalize">
                <TagIcon class="mr-1 size-3" />
                {{ getBackgroundLabel(label) }}
              </Badge>
              <Badge variant="outline" class="capitalize">
                Preview {{ label.options?.preview ? "on" : "off" }}
              </Badge>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <AppLabelUpdate :label="label">
            <Button variant="ghost" size="icon">
              <PencilIcon class="size-4" />
            </Button>
          </AppLabelUpdate>
          <AppConfirmDialog
            title="Delete label"
            :description="`Are you sure you want to delete ${capitalize(label.name)}?`"
            :buttons="{
              confirm: { text: 'Delete label', variant: 'destructive' },
              cancel: { text: 'Cancel', variant: 'ghost' },
            }"
            @confirm="emit('delete', label)"
          >
            <Button variant="ghost" size="icon" class="text-red-500">
              <Trash2Icon class="size-4" />
            </Button>
          </AppConfirmDialog>
        </div>
      </div>
    </VueDraggableNext>
  </div>
</template>

<style scoped>
@reference "@/assets/css/tailwind.css";

.ghost {
  @apply bg-muted border-2 opacity-50;
}

.chosen {
  @apply ring-2 ring-blue-500;
}

.dragging {
  @apply border-2 border-blue-500 ring-0;
}
</style>
