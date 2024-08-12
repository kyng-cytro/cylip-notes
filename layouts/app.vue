<script setup lang="ts">
onMounted(() => {
  useNoteStore().initStore();
});

onBeforeUnmount(() => {
  useNoteStore().$dispose();
});
</script>

<template>
  <Toaster class="pointer-events-auto" />
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <div
    class="grid min-h-screen w-full bg-background text-foreground scrollbar-track-background scrollbar-thumb-muted lg:grid-cols-[280px_1fr]"
  >
    <AppSideBar />
    <div class="flex flex-col">
      <AppHeader />
      <PlusModalNuxtPage v-slot="{ route }">
        <NuxtPage :route="route" />
      </PlusModalNuxtPage>
    </div>
  </div>
</template>

<style>
/* modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* basic editor styles */
.tiptap :first-child {
  margin-top: 0;
}

/* blockquote styles */
blockquote {
  border-left: 3px solid var(--gray-3);
  margin: 1.5rem 0;
  padding-left: 1rem;
}

/* list styles */
.tiptap ul,
.tiptap ol {
  padding: 0 1rem;
  margin: 1.25rem 1rem 1.25rem 0.4rem;
}

.tiptap ul li p,
.tiptap ol li p {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

/* placeholder styles */
.tiptap p.is-editor-empty:first-child::before {
  @apply text-muted-foreground;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tiptap p {
  word-break: break-all;
}

/* task list specific styles */
.tiptap ul[data-type="taskList"] {
  list-style: none;
  margin-left: 0;
  padding: 0;
}

.tiptap ul[data-type="taskList"] li {
  align-items: flex-start;
  display: flex;
}

.tiptap ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.tiptap ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

.tiptap ul[data-type="taskList"] input[type="checkbox"] {
  cursor: pointer;
}

.tiptap ul[data-type="taskList"] ul[data-type="taskList"] {
  margin: 0;
}

.tiptap mark {
  border-radius: 0.3rem;
  box-decoration-break: clone;
  padding: 0.1rem 0.3rem;
}

.tiptap mark * {
  color: black;
}

.tiptap pre {
  background: var(--black);
  border-radius: 0.5rem;
  color: var(--white);
  font-family: "JetBrainsMono", monospace;
  margin: 1.5rem 0;
  padding: 0.75rem 1rem;
}

.tiptap pre code {
  background: none;
  color: inherit;
  font-size: 0.8rem;
  padding: 0;
}

/* gap cursor */
.tiptap img {
  display: block;
  margin: 1.5rem 0;
  width: 100%;
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
}

/* collaboration cursor */
.collaboration-cursor__caret {
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

/* render the username above the caret */
.collaboration-cursor__label {
  border-radius: 3px 3px 3px 0;
  color: #0d0d0d;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  position: absolute;
  top: 1.4em;
  user-select: none;
  white-space: nowrap;
}

.tiptap img.ProseMirror-selectednode {
  @apply outline outline-ring;
}

/* code styling */
.hljs-comment,
.hljs-quote {
  color: #616161;
}

.hljs-variable,
.hljs-template-variable,
.hljs-attribute,
.hljs-tag,
.hljs-name,
.hljs-regexp,
.hljs-link,
.hljs-selector-id,
.hljs-selector-class {
  color: #f98181;
}

.hljs-number,
.hljs-meta,
.hljs-built_in,
.hljs-builtin-name,
.hljs-literal,
.hljs-type,
.hljs-params {
  color: #fbbc88;
}

.hljs-string,
.hljs-symbol,
.hljs-bullet {
  color: #b9f18d;
}

.hljs-title,
.hljs-section {
  color: #faf594;
}

.hljs-keyword,
.hljs-selector-tag {
  color: #70cff8;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: 700;
}
</style>
