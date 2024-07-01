<template>
  <Toaster />
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <div
    class="grid min-h-screen w-full bg-background text-foreground lg:grid-cols-[280px_1fr]"
  >
    <DashboardSideBar />
    <div class="flex flex-col">
      <DashboardHeader />
      <NuxtPage />
    </div>
  </div>
</template>
