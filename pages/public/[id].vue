<script setup lang="ts">
import { contentToHtml } from "@/lib/tiptap";
import { CopyIcon } from "lucide-vue-next";

const { id } = useRoute("public-id").params;
const { data: note, pending } = await useFetch(`/api/notes/${id}/public`, {
  lazy: true,
});
const { copy } = useCustomClipboard();
const { formatToTimeAgo } = useDateUtils();

useHead({
  title: () => note.value?.title || "cylip|notes",
  meta: [{ name: "description", content: "View this note on cylip|notes." }],
});

const contentRef = ref<HTMLElement | null>(null);
const content = ref("");
const loaded = ref(false);
const pageBackground = useState<string>("background");

onMounted(() => {
  if (!note.value?.content) return;
  content.value = contentToHtml(note.value.content);
  pageBackground.value = applyBackground(
    useColorMode().value === "dark",
    note.value.background ?? undefined,
  );
  loaded.value = true;
});

useCodeHighlight(contentRef, content);
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
      class="prose text-primary dark:prose-invert h-full max-w-none space-y-2 px-1 outline-none"
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
      <div class="max-h-[calc(100vh-12rem)] scrollbar-thin overflow-y-auto">
        <div class="flex h-[calc(100vh-12rem)] flex-col" v-if="!loaded">
          <EditorLoading />
        </div>
        <div ref="contentRef" class="tiptap" v-html="content" v-else />
      </div>
      <div class="flex items-center justify-end gap-2 px-4 py-2">
        <span class="text-sm">⏳ {{ formatToTimeAgo(note.updatedAt) }} </span>
        <span>•</span>
        <span class="text-sm">👀 {{ note.visits }} </span>
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

<style>
@import "@/assets/css/tiptap-default.css";
</style>
