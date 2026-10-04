<script setup lang="ts">
definePageMeta({ layout: "app" });

const noteStore = useNoteStore();
await noteStore.ensureStarted();
const noteId = noteStore.createNote(useLayoutStore().label);
await navigateTo(`/app/notes/${noteId}`, { replace: true });
</script>
<template>
  <div />
</template>
