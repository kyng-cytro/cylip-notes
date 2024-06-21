<template>
  <div class="relative">
    <NuxtLink
      to="/"
      class="scroll-m-20 font-mono text-2xl font-bold tracking-tight lg:p-2"
      @click="$emit('logo-click')"
    >
      <span>cylip</span>
      <span>|</span>
      <span class="text-slate-400 dark:text-slate-600">notes</span>
    </NuxtLink>
    <span class="absolute -right-5 -top-3 text-xs font-semibold tracking-tight"
      >[BETA]</span
    >
  </div>
</template>
