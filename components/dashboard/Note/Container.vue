<script setup lang="ts">
import { VueDraggableNext } from "vue-draggable-next";

const drag = ref(false);

const dragOptions = {
  animation: 200,
  delay: 150,
  delayOnTouchOnly: true,
  ghostClass: "ghost",
  chosenClass: "chosen",
  dragClass: "dragging",
};

const notes = ref([
  {
    id: 1,
    title: "Note 1",
    content: "Sample note",
  },
  {
    id: 2,
    title: "Note 2",
    content: "Sample note",
  },
  {
    id: 3,
    title: "Note 3",
    content: "Sample note",
  },
  {
    id: 4,
    title: "Note 4",
    content: "Sample note",
  },
  {
    id: 5,
    title: "Note 5",
    content: "Sample note",
  },
  {
    id: 6,
    title: "Note 6",
    content: "Sample note",
  },
  {
    id: 7,
    title: "Note 7",
    content: "Sample note",
  },
  {
    id: 8,
    title: "Note 8",
    content: "Sample note",
  },
  {
    id: 9,
    title: "Note 9",
    content: "Sample note",
  },
  {
    id: 10,
    title: "Note 10",
    content: "Sample note",
  },
]);

const power = ref(10);

const { vibrate, isSupported } = useVibrate();

const dragStart = () => {
  if (isSupported.value) vibrate(power.value);
  drag.value = true;
};

const dragEnd = () => {
  drag.value = false;
};
</script>

<template>
  <Input type="number" v-model="power" class="max-w-xs" />
  <VueDraggableNext
    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    v-bind="dragOptions"
    v-model="notes"
    @start="dragStart"
    @end="dragEnd"
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
