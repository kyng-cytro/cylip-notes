<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

definePageMeta({
  layout: "app",
});

const { id } = useRoute("app-notes-id").params;

const noteStore = useNoteStore();

const { copy } = useCustomClipboard();
const { formatToTimeAgo } = useDateUtils();
const { data: note, status } = await useFetch(`/api/notes/${id}`);

const editor = ref<Editor>();
const initialized = ref(false);
const title = ref(note.value?.title);
const trashed = computed(() => note.value?.trashed || false);
const archived = computed(() => note.value?.archived || false);

onMounted(async () => {
  if (!note.value) return;
  const { editor: currentEditor, initialized: ready } = await useEditor({
    roomId: note.value!.id,
    autofocus: true,
    disabled: trashed.value,
  });
  editor.value = currentEditor;
  initialized.value = ready.value;
});

watchDebounced(
  title,
  async () => {
    if (!title.value || title.value === note.value?.title || trashed.value)
      return;
    await noteStore.methods.updateNote(note.value!.id, "title", title.value);
  },
  { debounce: 1000 },
);
</script>
<template>
  <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <div class="grid h-full grid-cols-4 gap-4">
      <Skeleton class="col-span-3 min-h-full w-full" />
      <Skeleton class="col-space-1 min-h-full w-full" />
    </div>
  </main>
</template>
