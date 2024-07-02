<script setup lang="ts">
import { VueDraggableNext } from "vue-draggable-next";

const notes = defineModel<
  {
    id: number;
    title: string;
    content: string;
    pinned?: boolean;
  }[]
>("notes", { default: [] });

const drag = ref(false);

const dragOptions = {
  animation: 200,
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: "ghost",
  chosenClass: "chosen",
  dragClass: "dragging",
};

const { vibrate, isSupported } = useVibrate();

const dragStart = () => {
  if (isSupported.value) vibrate(1);
  drag.value = true;
};
</script>

<template>
  <VueDraggableNext
    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    v-bind="dragOptions"
    v-model="notes"
    @start="dragStart"
    @end="drag = false"
  >
    <TransitionGroup :name="!drag ? 'flip-list' : undefined">
      <DashboardNote :note="note" v-for="note in notes" :key="note.id" />
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
  @apply bg-muted opacity-50;
}

.chosen {
  @apply ring-2 ring-blue-500;
}

.dragging {
  @apply border-2 border-blue-500 ring-0;
}
</style>
