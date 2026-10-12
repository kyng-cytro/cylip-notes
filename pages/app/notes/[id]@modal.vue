<script setup lang="ts">
import { XCircle } from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params as { id: string };
await useNoteStore().ensureStarted();
const {
  note,
  editor,
  loading,
  locked,
  historyOpen,
  unlock,
  passkey,
  remember,
  reset,
  title,
  canEdit,
  canEditTitle,
  background,
  suggestTitle,
} = useNotePage(id);
const viewportBox = useVisualViewportBox();
const backdrop = useBackdropClose(() => useModalRouter().close());
useScrollLock(() => (import.meta.client ? document.body : null), true);
</script>
<template>
  <div
    class="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-black/80 p-4"
    :style="viewportBox"
    @pointerdown="backdrop.onPointerdown"
    @click="backdrop.onClick"
  >
    <Card
      v-motion-slide-left
      :duration="500"
      v-if="note && editor"
      @click.stop
      tabindex="-1"
      :style="background"
      class="z-50 flex h-full w-full max-w-2xl flex-col transition-colors duration-300 ease-in-out lg:max-h-[80%]"
    >
      <CardHeader class="space-y-4">
        <div class="flex items-center justify-between">
          <TooltipWrapper tooltip="Close note">
            <Button
              size="icon"
              class="-ml-2"
              variant="ghost"
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
              :cb="() => navigateTo('/app')"
              @history="historyOpen = true"
            />
          </div>
        </div>
        <div class="lg:pl-12">
          <AppNoteTitleInput
            v-model="title"
            :disabled="!canEditTitle"
            :suggest="{
              fn: suggestTitle,
              enabled:
                canEditTitle && !title && hasEnoughContent(editor.getText()),
            }"
          />
        </div>
      </CardHeader>
      <CardContent class="relative min-h-0 flex-1 overflow-hidden lg:pl-18">
        <AppNoteHistoryPreview v-if="historyOpen" :note-id="id" />
        <div v-show="!historyOpen" class="h-full">
          <Editor :editor="editor" />
        </div>
      </CardContent>
      <CardFooter class="flex flex-col items-stretch gap-2 px-4 py-2">
        <AppNoteHistoryBar
          v-if="historyOpen"
          :note-id="id"
          :editor
          :can-restore="canEdit"
        />
        <template v-else>
          <EditorToolbar v-if="canEdit" :editor="editor" />
          <AppNoteLastEdited :note="note" class="self-end" />
        </template>
      </CardFooter>
    </Card>
    <Card
      v-else-if="locked"
      @click.stop
      class="z-50 flex h-full w-full max-w-2xl flex-col p-6 lg:max-h-[80%]"
    >
      <TooltipWrapper tooltip="Close note">
        <Button
          size="icon"
          class="-ml-2"
          variant="ghost"
          @click="useModalRouter().close()"
        >
          <XCircle class="size-5" />
        </Button>
      </TooltipWrapper>
      <AppNoteUnlock :unlock :passkey v-model:remember="remember" :reset />
    </Card>
    <Card
      v-else-if="loading"
      class="z-50 flex h-full w-full max-w-2xl flex-col p-6 lg:max-h-[80%]"
    >
      <EditorLoading />
    </Card>
  </div>
</template>
