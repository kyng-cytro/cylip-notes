<script setup lang="ts">
import { VueDraggableNext } from "vue-draggable-next";
import type { Note } from "@/server/utils/drizzle";

const { disabled } = defineProps<{
  disabled?: boolean;
}>();

const notes = defineModel<Note[]>("notes", { default: [] });

const dragOptions = {
  disabled,
  animation: 200,
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: "ghost",
  chosenClass: "chosen",
  dragClass: "dragging",
};

const { conatinerStyles: layoutStyles } = useLayout();

const drag = ref(false);

const { vibrate, isSupported } = useVibrate();

const dragStart = () => {
  if (isSupported.value) vibrate(1);
  drag.value = true;
};

const setLeaveSize = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  Object.assign((el as HTMLElement).style, {
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute",
  });
};
</script>

<template>
  <VueDraggableNext
    :class="layoutStyles"
    v-bind="dragOptions"
    v-model="notes"
    @start="dragStart"
    @end="drag = false"
  >
    <TransitionGroup
      @before-leave="setLeaveSize"
      :name="!drag ? 'flip-list' : undefined"
    >
      <AppNote :note="note" v-for="note in notes" :key="note.id" />
    </TransitionGroup>
  </VueDraggableNext>
</template>

<style scoped>
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
  @apply border-2 bg-muted opacity-50;
}

.chosen {
  @apply ring-2 ring-blue-500;
}

.dragging {
  @apply border-2 border-blue-500 ring-0;
}
</style>
