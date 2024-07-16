<script setup lang="ts">
import { RotateCw } from "lucide-vue-next";
const noteStore = useNoteStore();
const { fetching } = storeToRefs(noteStore);
</script>
<template>
  <Button
    variant="ghost"
    size="icon"
    :class="{ 'text-muted-foreground': !fetching }"
    @click="noteStore.refreshData"
  >
    <RotateCw class="size-4" :class="{ 'animate-spin': fetching }" />
  </Button>
</template>
