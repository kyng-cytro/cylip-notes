<template>
  <div class="relative">
    <NuxtLink
      to="/"
      class="scroll-m-20 font-mono text-2xl font-bold tracking-tight"
      @click="$emit('logo-click')"
    >
      <span>cylip</span>
      <span>|</span>
      <span class="text-slate-400 dark:text-slate-600">notes</span>
    </NuxtLink>
    <span class="absolute -top-3.5 text-sm font-semibold">[BETA]</span>
  </div>
</template>
