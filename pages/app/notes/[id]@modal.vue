<script setup lang="ts">
import { XCircle } from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params as { id: string };
const { note, editor, title, canEdit, background, suggestTitle } =
  await useNotePage(id);
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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
        <AppNoteTitleInput
          v-model="title"
          :disabled="!canEdit"
          :suggest="{
            fn: suggestTitle,
            enabled: canEdit && !title && hasEnoughContent(editor.getText()),
          }"
        />
        <EditorToolbar :editor="editor" />
      </CardHeader>
      <CardContent class="relative -m-1 flex-1 overflow-hidden">
        <Editor :editor="editor" />
      </CardContent>
      <CardFooter class="flex justify-end px-4 py-2">
        <AppNoteLastEdited :note="note" />
      </CardFooter>
    </Card>
  </div>
</template>
