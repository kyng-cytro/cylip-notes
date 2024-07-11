<template>
  <NuxtLink
    to="/app"
    class="font-mono tracking-tight"
    @click="$emit('logo-click')"
  >
    <span>cylip</span>
    <span>|</span>
    <span class="text-slate-400 dark:text-slate-600">notes</span>
    <span class="sr-only">cylip|notes</span>
  </NuxtLink>
</template>
