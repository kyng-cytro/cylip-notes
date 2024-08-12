<script setup lang="ts">
import {
  Pin,
  PinOff,
  Archive,
  BellRing,
  ArchiveX,
  XCircle,
} from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params as { id: string };

const noteStore = useNoteStore();

const note = noteStore.methods.getNoteById(id);

const title = ref(note?.title);

const trashed = computed(() => note?.trashed || false);
const archived = computed(() => note?.archived || false);

const { editor } = await useEditor({
  roomId: note!.id,
  autofocus: true,
  disabled: trashed.value,
  initialValue: note?.content,
});

const { copy } = useCustomClipboard();

const { formatToTimeAgo } = useDateUtils();

const openHandler = () => {
  return navigateTo(`/app/notes/${id}`, {
    external: true,
  });
};

const archiveHandler = async () => {
  await noteStore.methods.toggleNoteProp(note!, "archived");
  useModalRouter().close();
};

const deleteHandler = async () => {
  await noteStore.methods.toggleNoteProp(note!, "trashed");
  useModalRouter().close();
};

const shareHandler = () => {};

const makeACopyHandler = () => {};

watchDebounced(
  title,
  async () => {
    if (!title.value || title.value === note!.title || trashed.value) return;
    await noteStore.methods.updateNote(note!.id, "title", title.value);
  },
  { debounce: 1000 },
);
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    @click="useModalRouter().close()"
  >
    <Card
      class="z-50 flex h-full w-full max-w-2xl flex-col lg:max-h-[80%]"
      tabindex="-1"
      @click.stop
      v-if="note"
    >
      <CardHeader class="space-y-4">
        <div class="flex items-center justify-between">
          <TooltipWrapper tooltip="Close note">
            <Button
              variant="link"
              class="-ml-3 text-muted-foreground hover:text-primary"
              size="xs"
              @click="useModalRouter().close()"
            >
              <XCircle class="size-5" />
            </Button>
          </TooltipWrapper>
          <div
            class="flex items-center gap-2 text-muted-foreground"
            v-if="!trashed"
          >
            <TooltipWrapper tooltip="Pin note">
              <Button
                variant="ghost"
                size="xs"
                @click="noteStore.methods.toggleNoteProp(note, 'pinned')"
              >
                <PinOff class="size-5" v-if="false" />
                <Pin class="size-5" v-else />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="Remind me">
              <Button variant="ghost" size="xs">
                <BellRing class="size-5" />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper :tooltip="archived ? 'Unarchive' : 'Archive'">
              <Button variant="ghost" size="xs" @click="archiveHandler">
                <Archive class="size-5" v-if="!archived" />
                <ArchiveX class="size-5" v-else />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
        <AppNoteTitleInput
          v-model="title"
          :disabled="trashed"
          @open-note="openHandler"
          @delete-note="deleteHandler"
          @share-note="shareHandler"
          @copy-to-clipboard="() => copy(editor.getHTML(), true)"
        />
        <EditorToolbar :editor="editor" :disabled="trashed" />
      </CardHeader>
      <CardContent class="flex-1 space-y-4 overflow-y-auto scrollbar-none">
        <Editor :editor="editor" oncontextmenu="return false;" />
      </CardContent>
      <CardFooter class="flex justify-end border-t py-2">
        <p
          class="space-x-2 whitespace-nowrap text-sm font-medium leading-none text-muted-foreground"
        >
          <template v-if="trashed">
            <span>Note in Trash</span>
            <span>•</span>
          </template>
          <span>Edited: {{ formatToTimeAgo(note.updatedAt) }} </span>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
