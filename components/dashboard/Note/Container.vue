<script setup lang="ts">
import { VueDraggableNext } from "vue-draggable-next";

const drag = ref(false);

const dragOptions = {
  animation: 200,
  ghostClass: "ghost",
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
</script>

<template>
  <VueDraggableNext
    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    v-bind="dragOptions"
    v-model="notes"
    @start="drag = true"
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
</style>
