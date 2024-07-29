<script setup lang="ts">
import { VueDraggableNext } from "vue-draggable-next";
import type { Note } from "@/server/utils/drizzle";

const notes = defineModel<Note[]>("notes", { default: [] });

const dragOptions = {
  animation: 200,
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: "ghost",
  chosenClass: "chosen",
  dragClass: "dragging",
};

const { layout } = storeToRefs(useLayoutStore());

const drag = ref(false);

const layoutStyles = computed(() => ({
  "flex-wrap": layout.value === "grid",
  "flex-col": layout.value === "list",
}));

const { vibrate, isSupported } = useVibrate();

const dragStart = () => {
  if (isSupported.value) vibrate(1);
  drag.value = true;
};
</script>

<template>
  <VueDraggableNext
    class="flex gap-4"
    :class="layoutStyles"
    v-bind="dragOptions"
    v-model="notes"
    @start="dragStart"
    @end="drag = false"
  >
    <TransitionGroup :name="!drag ? 'flip-list' : undefined">
      <AppNote :note="note" v-for="note in notes" :key="note.id" />
    </TransitionGroup>
  </VueDraggableNext>
</template>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
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
