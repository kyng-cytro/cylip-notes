<template>
  <NuxtRouteAnnouncer />
  <div
    class="flex min-h-screen flex-col justify-between bg-background text-foreground"
  >
    <LandingHeader />
    <main>
      <NuxtPage />
    </main>
    <LandingFooter />
  </div>
</template>
