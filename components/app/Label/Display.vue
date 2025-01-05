<script setup lang="ts">
import { TagIcon } from "lucide-vue-next";
defineProps<{
  name: string;
}>();
</script>
<template>
  <Badge class="capitalize">
    <TagIcon class="mr-2 size-4" />
    <span> {{ name }}</span>
  </Badge>
</template>
