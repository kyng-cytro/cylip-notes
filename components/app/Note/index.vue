<script setup lang="ts">
import type { Note } from "@/server/utils/drizzle";

const props = defineProps<{
  note: Note;
}>();

const { layout } = storeToRefs(useLayoutStore());
const { convertToHtml } = useEditorUtils();

const openModal = () => {
  useModalRouter().push(`/app/notes/${props.note.id}`);
};

const content = computed(() => {
  return convertToHtml(props.note.content);
});
</script>
<template>
  <Card
    tabindex="0"
    class="group mb-2 flex w-full cursor-pointer break-inside-avoid flex-col gap-3 rounded-lg p-4 ring-blue-500 focus:outline-none focus:ring-2"
    :class="{
      'max-w-none': layout === 'list',
    }"
    @click="openModal"
  >
    <!-- Empty note -->
    <template v-if="!note.title && !content">
      <CardTitle class="font-semibold leading-snug text-muted-foreground">
        Empty note
      </CardTitle>
    </template>

    <template v-else>
      <!-- Header -->
      <div v-if="note.title">
        <CardTitle class="line-clamp-2 font-semibold leading-snug">{{
          note.title
        }}</CardTitle>
      </div>
      <!-- Content -->
      <div
        class="line-clamp-[18] max-h-96 overflow-hidden"
        v-if="note.showPreview && content"
      >
        <p
          v-html="content"
          class="tiptap prose pointer-events-none relative max-w-none flex-1 text-sm dark:prose-invert"
        />
      </div>
      <!-- Label & Reminder -->
      <div
        class="mt-3 flex items-center gap-4 text-muted-foreground"
        v-if="note.label"
      >
        <Badge class="text-xs capitalize" v-if="note.label">
          {{ note.label.name }}
        </Badge>
      </div>
    </template>
    <!-- Actions -->
    <div
      class="mt-3 flex items-center justify-between gap-3 overflow-y-auto scrollbar-none group-hover:visible group-focus:visible lg:invisible"
      @click.stop
    >
      <AppNoteActions :note="note" />
    </div>
  </Card>
</template>
