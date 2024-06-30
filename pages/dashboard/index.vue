<script setup lang="ts">
import { LayoutGrid, StretchHorizontal } from "lucide-vue-next";
definePageMeta({
  layout: "dashboard",
});

const layout = ref("grid");
</script>

<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <div class="flex items-center justify-between">
      <DashboardNoteGroupSelect />
      <Button
        variant="ghost"
        size="icon"
        @click="layout = layout === 'grid' ? 'stretch' : 'grid'"
      >
        <Transition name="fade" mode="out-in">
          <LayoutGrid v-if="layout === 'grid'" />
          <StretchHorizontal v-else />
        </Transition>
        <span class="sr-only">Toggle layout</span>
      </Button>
    </div>
    <DashboardNoteContainer />
    <!-- <DashboardEmptyPage -->
    <!--   title="No notes yet" -->
    <!--   subtitle="Create your first note to get started" -->
    <!--   :button="{ text: 'Create Note', to: '/dashboard/create-note' }" -->
    <!-- /> -->
  </main>
</template>

<style scoped>
.fade-enter-active {
  animation: scale-up-center 0.25s ease 0s 1 normal none;
}
.fade-leave-active {
  animation: scale-down-center 0.25s ease 0s 1 normal none;
}
@keyframes scale-up-center {
  0% {
    transform: scale(0.2);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes scale-down-center {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.2);
  }
}
</style>
