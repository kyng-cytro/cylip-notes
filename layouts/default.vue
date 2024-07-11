<template>
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <div
    class="min-h-screen bg-background text-foreground scrollbar-track-background scrollbar-thumb-muted"
  >
    <div class="mx-auto max-w-7xl">
      <main class="py-8">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
