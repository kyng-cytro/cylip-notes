<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

definePageMeta({
  layout: "app",
});

const { id } = useRoute("app-notes-id").params;
const noteStore = useNoteStore();
const { copy } = useCustomClipboard();
const { formatToTimeAgo } = useDateUtils();
const { data: note, pending, refresh } = await useFetch(`/api/notes/${id}`);

const tab = ref("note");
const mouting = ref(true);
const editor = ref<Editor>();
const initialized = ref(false);
const title = ref(note.value?.title);
const { labels } = storeToRefs(useNoteStore());
const trashed = computed(() => note.value?.trashed || false);
const archived = computed(() => note.value?.archived || false);

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

const refreshHandler = async () => {
  mouting.value = true;
  await refresh();
  await initializeEditor();
};

const archiveHandler = async () => {
  if (!note.value) return;
  await noteStore.methods.toggleNoteProp(note.value, "archived");
  navigateTo("/app");
};

const assignLabelHandler = async (labelId: string | null) => {
  if (!note.value) return;
  await noteStore.methods.assignLabel(note.value, labelId);
  await refreshHandler();
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
      class="grid h-full grid-cols-1 grid-rows-2 gap-4 md:grid-cols-[auto_250px] md:grid-rows-1 lg:grid-cols-[auto_300px]"
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
        <Card class="p-3">
          <Tabs default-value="note" class="w-full space-y-3" v-model="tab">
            <TabsList name="note" class="grid w-full grid-cols-2">
              <TabsTrigger value="note">Note</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <AppNoteTabsContentInfo
              :note="note"
              @assign-label="assignLabelHandler"
            />
            <TabsContent value="history"> Note History </TabsContent>
          </Tabs>
        </Card>
      </template>
    </div>
  </main>
</template>
