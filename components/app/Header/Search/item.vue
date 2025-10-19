<script setup lang="ts">
defineProps<{ item: { id: string; title: string; snippet: string } }>();
</script>
<template>
  <PlusModalLink
    :to="`/app/notes/${item.id}`"
    class="hover:bg-muted flex w-full flex-col gap-1 rounded-md p-2"
  >
    <h3 class="text-sm font-semibold">
      {{ item.title }}
    </h3>
    <p
      v-html="item.snippet"
      class="text-muted-foreground line-clamp-2 text-xs"
    />
  </PlusModalLink>
</template>
