<script setup lang="ts">
import { VueDraggableNext } from "vue-draggable-next";
import type { ClientNote } from "@/lib/types";

const props = defineProps<{
  notes: ClientNote[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  reorder: [orderedIds: string[]];
}>();

const dragOptions = computed(() => ({
  disabled: props.disabled,
  animation: 200,
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: "ghost",
  chosenClass: "chosen",
  dragClass: "dragging",
}));

const { conatinerStyles: layoutStyles } = useLayout();

const drag = ref(false);
const localNotes = ref<ClientNote[]>([]);

const { vibrate, isSupported } = useVibrate();

const dragStart = () => {
  if (isSupported.value) vibrate(1);
  drag.value = true;
};

const dragEnd = () => {
  drag.value = false;
  emit(
    "reorder",
    localNotes.value.map((note) => note.id),
  );
};

const setLeaveSize = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  Object.assign((el as HTMLElement).style, {
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute",
  });
};

watch(
  () => props.notes,
  (value) => {
    if (drag.value) return;
    localNotes.value = [...value];
  },
  { immediate: true },
);
</script>
<template>
  <VueDraggableNext
    :class="layoutStyles"
    v-bind="dragOptions"
    v-model="localNotes"
    @start="dragStart"
    @end="dragEnd"
  >
    <TransitionGroup
      @before-leave="setLeaveSize"
      :name="!drag ? 'flip-list' : undefined"
    >
      <AppNote :note="note" v-for="note in localNotes" :key="note.id" />
    </TransitionGroup>
  </VueDraggableNext>
</template>

<style scoped>
@reference "@/assets/css/tailwind.css";

.flip-list-move,
.flip-list-enter-active,
.flip-list-leave-active {
  transition: all 0.5s ease;
}

.flip-list-enter-from,
.flip-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.flip-list-leave-active {
  position: absolute;
  width: auto;
  max-width: 100%;
}

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
