<script setup lang="ts">
definePageMeta({
  layout: "app",
});

const { id } = useRoute("app-notes-id").params;
const { note, editor, loading, title, canEdit, background, suggestTitle } =
  await useNotePage(id);
</script>
<template>
  <AppMainContainer
    :style="background"
    class="transition-colors duration-300 ease-in-out"
  >
    <div v-if="loading" class="mx-auto h-full w-full max-w-3xl py-6">
      <EditorLoading />
    </div>
    <AppEmptyPage
      v-else-if="!note || !editor"
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
      <div class="lg:pl-12">
        <AppNoteTitleInput
          large
          v-model="title"
          :disabled="!canEdit"
          :suggest="{
            fn: suggestTitle,
            enabled: canEdit && !title && hasEnoughContent(editor.getText()),
          }"
        />
      </div>
      <div
        class="relative -mx-6 max-h-[calc(100dvh-18rem)] min-h-0 flex-1 overflow-hidden p-6 lg:pl-18"
      >
        <Editor :editor="editor" />
      </div>
      <div class="flex flex-col items-stretch gap-2 px-4 py-2">
        <EditorToolbar v-if="canEdit" :editor="editor" />
        <AppNoteLastEdited :note="note" class="self-end" />
      </div>
    </div>
  </AppMainContainer>
</template>
