<script setup lang="ts">
defineProps<{
  icon: Component;
  title: string;
  to: string;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="text-muted-foreground hover:text-primary flex items-center gap-2 rounded-lg px-3 py-2 transition-all"
    active-class="bg-muted text-primary"
  >
    <component class="h-4 w-4" :is="icon" />
    {{ title }}
  </NuxtLink>
</template>
