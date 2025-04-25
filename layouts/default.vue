<template>
  <Toaster class="pointer-events-auto" />
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <div
    class="min-h-screen bg-background text-foreground scrollbar-track-background scrollbar-thumb-muted"
  >
    <main>
      <NuxtPage />
    </main>
  </div>
</template>
