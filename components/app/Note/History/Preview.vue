<script setup lang="ts">
import { EDITOR_CLASS } from "@/constants";
import { extensions } from "@/lib/tiptap";
import { VersionChanges } from "@/lib/tiptap/custom-extensions";
import { Editor, EditorContent } from "@tiptap/vue-3";

const { noteId } = defineProps<{ noteId: string }>();
const { selected } = useNoteHistory(noteId);

const preview = new Editor({
  editable: false,
  extensions: [...extensions, VersionChanges],
  editorProps: { attributes: { class: EDITOR_CLASS } },
});
watch(
  selected,
  (version) => {
    if (version) preview.commands.setContent(version.changes);
  },
  { immediate: true },
);
onBeforeUnmount(() => preview.destroy());
</script>

<template>
  <EditorLoading v-if="!selected" />
  <EditorContent v-else :editor="preview" class="h-full w-full" />
</template>
