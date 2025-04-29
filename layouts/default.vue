<script setup lang="ts">
const background = useState<string>("background");
const animate = ref(false);

watch(background, () => {
  animate.value = false;
  requestAnimationFrame(() => {
    animate.value = true;
  });
});
</script>
<template>
  <Toaster class="pointer-events-auto" />
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <div
    :style="background"
    :class="[
      'min-h-screen text-foreground transition-colors duration-700 ease-in-out scrollbar-track-background scrollbar-thumb-muted',
      { 'animate-bg-reveal': animate },
    ]"
  >
    <main>
      <NuxtPage />
    </main>
  </div>
</template>
