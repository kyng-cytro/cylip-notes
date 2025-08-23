<script setup lang="ts">
import "vue-sonner/style.css";
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
      'text-foreground scrollbar-track-background scrollbar-thumb-muted min-h-screen transition-colors duration-700 ease-in-out',
      { 'animate-bg-reveal': animate },
    ]"
  >
    <main>
      <NuxtPage />
    </main>
  </div>
</template>
