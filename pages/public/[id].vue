<script setup lang="ts">
const { id } = useRoute("public-id").params;
const { data: note, pending } = await useFetch(`/api/notes/${id}/public`, {
  lazy: true,
});
const content = ref("");
const loaded = ref(false);
onMounted(() => {
  if (!note.value?.content) return;
  const { convertToHtml } = useEditorUtils();
  content.value = convertToHtml(note.value.content);
  loaded.value = true;
});
</script>

<template>
  <div class="mx-auto h-full max-w-3xl flex-1 p-4 lg:p-6">
    <div v-if="pending" class="flex flex-col gap-4">
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-96 w-full" />
    </div>
    <div v-else-if="!note" class="flex h-96 flex-col gap-4">
      <AppEmptyPage
        class="col-span-2"
        title="Note not found"
        subtitle="The note you are looking for does not exist."
        :button="{ text: 'Go Back', to: '/' }"
      />
    </div>
    <div
      v-else
      class="prose h-full max-w-none px-1 text-primary outline-none scrollbar-thin dark:prose-invert"
    >
      <h2>{{ note.title }}</h2>
      <Skeleton class="h-96 w-full" v-if="!loaded" />
      <p v-html="content" v-else />
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/tiptap-default.css";
</style>
