<script setup lang="ts">
import { Pin, PinOff, Repeat2, Trash2 } from "lucide-vue-next";
import type { Note } from "@/server/utils/drizzle";

const { note } = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();
const { layout } = storeToRefs(useLayoutStore());
const { convertToHtml } = useEditorUtils();

const noContent = computed(() => {
  const content = convertToHtml(note.content);
  return !content || content.length < 10;
});

const openModal = () => {
  useModalRouter().push(`/app/notes/${note.id}`);
};
</script>
<template>
  <Card
    tabindex="0"
    class="group flex w-full max-w-sm flex-1 cursor-pointer flex-col gap-3 ring-blue-500 focus:outline-none focus:ring-2"
    :class="{
      'max-w-none self-start': noContent,
      'min-w-36 md:min-w-[300px]': layout === 'grid',
      'max-w-none': layout === 'list',
    }"
    @click="openModal"
  >
    <!-- Content -->
    <p
      v-html="convertToHtml(note.content)"
      v-if="!noContent"
      class="tiptap prose pointer-events-none relative max-h-32 min-h-32 max-w-none flex-1 overflow-y-hidden px-3 pt-2 text-muted-foreground dark:prose-invert"
    />
    <!-- Header -->
    <div
      class="flex items-center justify-between rounded-b-lg bg-muted px-3 py-2"
      :class="{ 'rounded-t-lg': noContent }"
    >
      <CardTitle
        class="line-clamp-1 text-xl"
        :class="{ 'text-muted-foreground': !note.title }"
        >{{ note.title || "Untitled" }}</CardTitle
      >
      <div
        class="flex items-center justify-between text-muted-foreground group-hover:visible group-focus:visible md:invisible"
      >
        <template v-if="!note.trashed">
          <TooltipWrapper tooltip="Pin note">
            <Button
              variant="ghost"
              size="icon"
              @click.stop="noteStore.methods.toggleNoteProp(note, 'pinned')"
            >
              <template v-if="note.pinned">
                <PinOff class="h-5 w-5 rotate-45" />
                <span class="sr-only">Pin note</span>
              </template>
              <template v-else>
                <Pin class="h-5 w-5 rotate-45" />
                <span class="sr-only">Unpin note</span>
              </template>
            </Button>
          </TooltipWrapper>
        </template>
        <template v-if="note.trashed">
          <TooltipWrapper tooltip="Restore note">
            <Button
              variant="ghost"
              size="icon"
              @click.stop="noteStore.methods.toggleNoteProp(note, 'trashed')"
            >
              <Repeat2 class="size-5" />
            </Button>
          </TooltipWrapper>
          <!-- TODO: implement delete permanently -->
          <TooltipWrapper tooltip="Delete permanently">
            <Button variant="ghost" size="icon">
              <Trash2 class="size-5" />
            </Button>
          </TooltipWrapper>
        </template>
      </div>
    </div>
  </Card>
</template>
