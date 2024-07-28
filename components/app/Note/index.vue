<script setup lang="ts">
import { Pin, PinOff } from "lucide-vue-next";
import type { Note } from "@/server/utils/drizzle";

const { note } = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();
const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "justify-between": layout.value === "grid",
  "justify-start gap-6": layout.value === "list",
}));

const { convertToHtml } = useEditorUtils();

const openModal = () => {
  useModalRouter().push(`/app/notes/${note.id}`);
};
</script>
<template>
  <Card
    class="group flex w-full cursor-pointer flex-col gap-3 p-4 pb-0 ring-blue-500 focus:outline-none focus:ring-2"
    tabindex="0"
    @click="openModal"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <CardTitle class="text-xl">{{ note.title }}</CardTitle>
      <div
        class="invisible flex items-center justify-between text-muted-foreground group-hover:visible group-focus:visible"
        v-if="!note.archived && !note.trashed"
      >
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
      </div>
    </div>

    <!-- Content -->
    <p
      class="tiptap prose pointer-events-none max-h-20 flex-1 overflow-y-hidden text-muted-foreground dark:prose-invert"
      v-html="convertToHtml(note.content)"
    />

    <!-- Footer -->
    <AppNoteFooter :class="layoutStyles" v-if="!note.trashed" />
    <AppNoteFooterInactive :class="layoutStyles" v-else />
  </Card>
</template>
