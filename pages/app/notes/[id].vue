<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

definePageMeta({
  layout: "app",
});

const { id } = useRoute("app-notes-id").params;

const noteStore = useNoteStore();

const { copy } = useCustomClipboard();
const { formatToTimeAgo } = useDateUtils();
const { data: note, pending } = await useFetch(`/api/notes/${id}`);

const mouting = ref(true);
const initialized = ref(false);
const title = ref(note.value?.title);
const editor = ref<Editor>();
const trashed = computed(() => note.value?.trashed || false);
const archived = computed(() => note.value?.archived || false);

onMounted(async () => {
  if (!note.value) return (mouting.value = false);
  const { editor: currentEditor, initialized: ready } = await useEditor({
    roomId: note.value!.id,
    autofocus: true,
    disabled: trashed.value,
  });
  editor.value = currentEditor;
  mouting.value = false;
  watch(ready, () => {
    initialized.value = ready.value;
  });
});

const archiveHandler = async () => {
  if (!note.value) return;
  await noteStore.methods.toggleNoteProp(note.value, "archived");
  navigateTo("/app");
};

const deleteHandler = async () => {
  if (!note.value) return;
  await noteStore.methods.toggleNoteProp(note.value, "trashed");
  navigateTo("/app");
};

const shareHandler = () => {};

const makeACopyHandler = () => {};

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
    <div
      class="grid h-full grid-cols-1 grid-rows-[auto_200px] gap-4 md:grid-cols-[auto_200px] md:grid-rows-1"
    >
      <template v-if="pending || mouting">
        <Skeleton class="min-h-full w-full" />
        <Skeleton class="min-h-full w-full" />
      </template>
      <template v-else-if="!note || !editor">
        <AppEmptyPage
          class="col-span-2"
          title="Note not found"
          subtitle="The note you are looking for does not exist."
          :button="{ text: 'Go Back', to: '/app' }"
        />
      </template>
      <template v-else>
        <div class="space-y-4 overflow-y-hidden">
          <AppNoteTitleInput
            large
            v-model="title"
            :disabled="trashed"
            @delete-note="deleteHandler"
            @share-note="shareHandler"
            @copy-to-clipboard="() => copy(editor!.getHTML(), true)"
          />
          <EditorToolbar :editor="editor" :disabled="trashed" large />
          <div class="h-full max-h-[calc(100vh-225px)] overflow-y-hidden">
            <Editor :editor="editor" :initialized />
          </div>
        </div>
        <Skeleton class="min-h-full w-full" />
      </template>
    </div>
  </main>
</template>
