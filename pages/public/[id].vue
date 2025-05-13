<script setup lang="ts">
import hljs from "highlight.js";
import { CopyIcon } from "lucide-vue-next";
const { id } = useRoute("public-id").params;
const contentRef = ref<HTMLElement | null>(null);
const { data: note, pending } = await useFetch(`/api/notes/${id}/public`, {
  lazy: true,
});
useHead({
  title: note.value?.title || "cylip|notes",
  meta: [
    {
      name: "description",
      content: "View this note on cylip|notes.",
    },
  ],
});
const content = ref("");
const loaded = ref(false);
const { copy } = useCustomClipboard();
const { formatToTimeAgo } = useDateUtils();
onMounted(async () => {
  if (!note.value?.content) return;
  const { convertToHtml } = useEditorUtils();
  content.value = convertToHtml(note.value.content);
  if (note.value.background && note.value.background.value) {
    useState("background", () =>
      applyBackground(useColorMode().value === "dark", note.value!.background),
    );
  }
  loaded.value = true;
  await nextTick();
  if (contentRef.value) {
    hljs.highlightAll();
  }
});
</script>

<template>
  <div class="mx-auto h-full max-w-3xl flex-1 px-4 pt-8">
    <div v-if="pending" class="flex h-[calc(100vh-12rem)] flex-col gap-10">
      <Skeleton class="h-16 w-full" />
      <EditorLoading />
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
      class="prose h-full max-w-none space-y-2 px-1 text-primary outline-none dark:prose-invert"
    >
      <h2>{{ note.title }}</h2>
      <Button
        size="icon"
        variant="ghost"
        v-if="loaded && content"
        @click="copy(content, true)"
      >
        <CopyIcon class="size-5" />
      </Button>
      <div class="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
        <div class="flex h-[calc(100vh-12rem)] flex-col" v-if="!loaded">
          <EditorLoading />
        </div>
        <p ref="contentRef" v-html="content" v-else />
      </div>
      <div class="flex items-center justify-end gap-2 px-4 py-2">
        <span class="text-sm">⏳ {{ formatToTimeAgo(note.updatedAt) }} </span>
        <span>•</span>
        <NuxtLink
          to="/"
          class="text-sm font-semibold no-underline hover:underline"
        >
          cylip|notes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/tiptap-default.css";
</style>
