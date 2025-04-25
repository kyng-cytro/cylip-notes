<script setup lang="ts">
import { XCircle } from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params as { id: string };
const noteStore = useNoteStore();
const note = ref(noteStore.methods.getNoteById(id));

const title = ref(note.value?.title || "");
const trashed = computed(() => note.value?.trashed || false);

const { editor, initialized } = await useEditor({
  roomId: note.value!.id,
  autofocus: true,
  disabled: trashed.value,
});

const refresh = () => {
  note.value = noteStore.methods.getNoteById(id);
};

watchDebounced(
  title,
  async () => {
    if (!title.value || title.value === note.value!.title || trashed.value)
      return;
    await noteStore.methods.updateNote(note.value!.id, "title", title.value);
  },
  { debounce: 1000 },
);
const { getBackgroundOptionCode } = useBackgroundOptions();
const isDark = computed(() => useColorMode().value === "dark");
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
  >
    <Card
      v-motion-slide-left
      :duration="500"
      v-if="note"
      @click.stop
      tabindex="-1"
      :style="getBackgroundOptionCode(isDark, note.options)"
      class="z-50 flex h-full w-full max-w-2xl flex-col transition-colors duration-300 ease-in-out lg:max-h-[80%]"
    >
      <CardHeader class="space-y-4">
        <div class="flex items-center justify-between">
          <TooltipWrapper tooltip="Close note">
            <Button
              variant="link"
              class="-ml-3 hover:text-secondary"
              size="xs"
              @click="useModalRouter().close()"
            >
              <XCircle class="size-5" />
            </Button>
          </TooltipWrapper>
          <div class="flex items-center justify-center gap-4">
            <AppNoteActions
              can-open
              :note="note"
              :editor="editor"
              :cb="() => navigateTo(`/app`)"
              :refresh="() => refresh()"
            />
          </div>
        </div>
        <AppNoteTitleInput
          v-model="title"
          can-open
          :disabled="!editor.isEditable"
        />
        <EditorToolbar :editor="editor" />
      </CardHeader>
      <CardContent class="relative -m-1 flex-1 overflow-hidden">
        <Editor :editor="editor" :initialized />
      </CardContent>
      <CardFooter class="flex justify-end px-4 py-2">
        <AppNoteLastEdited
          :trashed="trashed"
          :label="note.label"
          :updated-at="note.updatedAt"
          :public="note.options?.public"
          :reminder-at="note.reminderAt"
        />
      </CardFooter>
    </Card>
  </div>
</template>
