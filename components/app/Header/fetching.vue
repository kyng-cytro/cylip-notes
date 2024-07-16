<script setup lang="ts">
import { RotateCw } from "lucide-vue-next";
const { fetching } = storeToRefs(useNoteStore());
</script>
<template>
  <Button
    variant="ghost"
    size="icon"
    :class="{ 'text-muted-foreground': !fetching }"
  >
    <RotateCw :class="{ 'animate-spin:': fetching }" class="size-4" />
  </Button>
</template>
