<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

definePageMeta({
  layout: "app",
});

const { id } = useRoute("app-notes-id").params;
const noteStore = useNoteStore();
const { data: note, pending, refresh } = await useFetch(`/api/notes/${id}`);

const mouting = ref(true);
const editor = ref<Editor>();
const initialized = ref(false);
const title = ref(note.value?.title || "");
const trashed = computed(() => note.value?.trashed || false);

const initializeEditor = async () => {
  if (!note.value) return (mouting.value = false);
  // Clean up the existing editor instance if it exists
  if (editor.value) {
    editor.value.destroy();
    editor.value = undefined;
  }
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
};

onMounted(initializeEditor);

const refreshAndRemount = () => {
  refresh();
  initializeEditor();
};

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
  <AppMainContainer>
    <template v-if="pending || mouting">
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
      <div class="flex items-center justify-end gap-4">
        <AppNoteActions
          :note="note"
          :editor="editor"
          :cb="() => navigateTo(`/app`)"
          :refresh="() => refreshAndRemount()"
        />
      </div>
      <!-- Editor -->
      <AppNoteTitleInput large v-model="title" :disabled="trashed" />
      <EditorToolbar :editor="editor" :disabled="trashed" />
      <div class="flex-1 overflow-y-hidden">
        <Editor :editor="editor" :initialized />
      </div>
      <!-- Footer -->
      <div class="flex justify-end p-2">
        <AppNoteLastEdited
          :trashed="trashed"
          :label="note.label"
          :updated-at="note.updatedAt"
        />
      </div>
    </template>
  </AppMainContainer>
</template>
