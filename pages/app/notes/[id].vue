<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const { id } = useRoute("app-notes-id").params;
const { note, editor, title, canEdit, background, suggestTitle } =
  await useNotePage(id);
</script>
<template>
  <AppMainContainer
    :style="background"
    class="transition-colors duration-300 ease-in-out"
  >
    <AppEmptyPage
      v-if="!note || !editor"
      class="col-span-2"
      title="Note not found"
      subtitle="The note you are looking for does not exist."
      :button="{ text: 'Go Back', to: '/app' }"
    />
    <div
      v-else
      class="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 lg:gap-6"
    >
      <div class="flex items-center justify-end gap-4">
        <AppNoteActions
          :note="note"
          :editor="editor"
          :cb="() => navigateTo('/app')"
        />
      </div>
      <AppNoteTitleInput
        large
        v-model="title"
        :disabled="!canEdit"
        :suggest="{
          fn: suggestTitle,
          enabled: canEdit && !title && hasEnoughContent(editor.getText()),
        }"
      />
      <EditorToolbar :editor="editor" />
      <div
        class="relative -mx-6 max-h-[calc(100vh-22rem)] flex-1 overflow-hidden p-6"
      >
        <Editor :editor="editor" />
      </div>
      <div class="flex justify-end px-4 py-2">
        <AppNoteLastEdited :note="note" />
      </div>
    </div>
  </AppMainContainer>
</template>
