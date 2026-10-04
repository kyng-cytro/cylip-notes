<script setup lang="ts">
import { XCircle } from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params as { id: string };
const { note, editor, title, canEdit, background, suggestTitle } =
  await useNotePage(id);
const viewportBox = useVisualViewportBox();
const scrollLock = useScrollLock(() =>
  import.meta.client ? document.body : null,
);
onMounted(() => (scrollLock.value = true));
onBeforeUnmount(() => (scrollLock.value = false));
</script>
<template>
  <div
    class="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-black/80 p-4"
    :style="viewportBox"
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
            />
          </div>
        </div>
        <div class="lg:pl-12">
          <AppNoteTitleInput
            v-model="title"
            :disabled="!canEdit"
            :suggest="{
              fn: suggestTitle,
              enabled: canEdit && !title && hasEnoughContent(editor.getText()),
            }"
          />
        </div>
      </CardHeader>
      <CardContent class="relative min-h-0 flex-1 overflow-hidden lg:pl-18">
        <Editor :editor="editor" />
      </CardContent>
      <CardFooter class="flex flex-col items-stretch gap-2 px-4 py-2">
        <EditorToolbar v-if="canEdit" :editor="editor" />
        <AppNoteLastEdited :note="note" class="self-end" />
      </CardFooter>
    </Card>
  </div>
</template>
