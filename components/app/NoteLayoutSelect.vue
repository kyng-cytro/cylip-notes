<script setup lang="ts">
import { LayoutGrid, StretchHorizontal } from "lucide-vue-next";
const layoutStore = useLayoutStore();
const { layout } = storeToRefs(layoutStore);
</script>
<template>
  <Button variant="ghost" size="icon" @click="layoutStore.toggleLayout">
    <Transition name="fade" mode="out-in">
      <StretchHorizontal v-if="layout === 'grid'" />
      <LayoutGrid v-else />
    </Transition>
    <span class="sr-only">Toggle layout</span>
  </Button>
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
