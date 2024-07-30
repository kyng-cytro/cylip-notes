<script setup lang="ts">
import type { Note } from "@/server/utils/drizzle";

const props = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();
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
    class="group flex w-full max-w-sm flex-1 cursor-pointer flex-col gap-3 ring-blue-500 focus:outline-none focus:ring-2"
    :class="{
      'max-w-none self-start': !note.showPreview,
      'min-w-36 md:min-w-[300px]': layout === 'grid',
      'max-w-none': layout === 'list',
    }"
    @click="openModal"
  >
    <!-- Content -->
    <p
      v-if="note.showPreview && !content"
      class="pointer-events-none relative max-h-32 min-h-32 max-w-none px-3 pt-2 text-muted-foreground"
    >
      No content to preview.
    </p>
    <p
      v-html="content"
      v-if="note.showPreview && content"
      class="tiptap prose pointer-events-none relative max-h-32 min-h-32 max-w-none flex-1 overflow-y-hidden px-3 pt-2 dark:prose-invert"
    />
    <!-- Header -->
    <div
      class="flex items-center justify-between rounded-b-lg bg-muted px-3 py-2"
      :class="{ 'rounded-t-lg': !note.showPreview }"
    >
      <CardTitle
        class="line-clamp-1 text-xl"
        :class="{ 'text-muted-foreground': !note.title }"
        >{{ note.title || "Untitled" }}</CardTitle
      >
      <div
        class="flex items-center justify-between text-muted-foreground group-hover:visible group-focus:visible md:invisible"
      >
        <AppNoteActionsTrashed
          v-if="note.trashed"
          @restore="noteStore.methods.toggleNoteProp(note, 'trashed')"
        />
        <template v-else>
          <AppNoteActionsPin
            :pinned="note.pinned"
            @toggle-pinned="noteStore.methods.toggleNoteProp(note, 'pinned')"
          />
          <AppNoteActionsDropdown
            v-if="!note.archived"
            @delete="noteStore.methods.toggleNoteProp(note, 'trashed')"
            @archive="noteStore.methods.toggleNoteProp(note, 'archived')"
            @toggle-show-preview="
              noteStore.methods.toggleNoteProp(note, 'showPreview')
            "
          />
          <AppNoteActionsArchived
            v-else
            @unarchive="noteStore.methods.toggleNoteProp(note, 'archived')"
          />
        </template>
      </div>
    </div>
  </Card>
</template>
