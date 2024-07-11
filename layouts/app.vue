<script setup lang="ts">
onMounted(() => {
  useNoteStore().initStore();
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
