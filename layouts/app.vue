<script setup lang="ts">
onMounted(() => {
  // init Note Store
  useNoteStore().initStore();
  useOneSignalSetup().init();
});

onBeforeUnmount(() => {
  useNoteStore().$dispose();
});
</script>

<template>
  <Toaster class="pointer-events-auto" />
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <div
    class="grid min-h-screen w-full bg-background text-foreground scrollbar-track-background scrollbar-thumb-muted lg:grid-cols-[280px_1fr]"
  >
    <AppSideBar />
    <div class="flex flex-col">
      <AppHeader />
      <PlusModalNuxtPage v-slot="{ route }">
        <NuxtPage :route="route" />
      </PlusModalNuxtPage>
    </div>
  </div>
</template>

<style>
@import "@/assets/css/tiptap-default.css";
@import "@/assets/css/tiptap-extended.css";

/* modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
