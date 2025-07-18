<script setup lang="ts">
import { LockKeyholeOpen } from "lucide-vue-next";
defineProps<{ vists: number }>();
</script>
<template>
  <Badge class="bg-red-500 dark:bg-red-300">
    <LockKeyholeOpen class="mr-2 size-4" />
    <span v-if="vists > 0"> {{ vists }} Views </span>
    <span v-else> Public </span>
  </Badge>
</template>
