<script setup lang="ts">
import { toast } from "vue-sonner";
import { convertToMarkDown } from "@/lib/turndown";
import { Pin, PinOff, Archive, BellRing, ArrowLeft } from "lucide-vue-next";

const { editor } = useEditor();
const { copy } = useClipboard();
const { id } = useParallelRoute("modal")!.params;

const modal = ref<HTMLElement>();
useFocus(modal, { initialValue: true });

const openNote = () => {
  return navigateTo(`/app/notes/${id}`, {
    external: true,
  });
};

const copyToClipboard = async () => {
  const text = convertToMarkDown(editor.getHTML());
  if (!text) return toast.warning("No content to copy");
  await copy(text);
  return toast.success("Copied to clipboard");
};
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    @click="useModalRouter().close()"
  >
    <Card
      class="z-50 flex h-full w-full max-w-2xl flex-col lg:max-h-[80%]"
      ref="modal"
      tabindex="-1"
      @click.stop
    >
      <CardHeader class="space-y-4">
        <div class="flex items-center justify-between">
          <TooltipWrapper tooltip="Close note">
            <Button
              class="rounded-full px-0 text-muted-foreground"
              variant="ghost"
              size="xs"
              @click="useModalRouter().close()"
            >
              <ArrowLeft class="size-5" />
            </Button>
          </TooltipWrapper>
          <div class="flex items-center gap-2 text-muted-foreground">
            <TooltipWrapper tooltip="Pin note">
              <Button variant="ghost" size="xs">
                <PinOff class="size-5" v-if="false" />
                <Pin class="size-5" v-else />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="Remind me">
              <Button variant="ghost" size="xs">
                <BellRing class="size-5" />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="Archive">
              <Button variant="ghost" size="xs">
                <Archive class="size-5" />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
        <AppNoteTitleInput
          @open-note="openNote"
          @copy-to-clipboard="copyToClipboard"
        />
        <EditorToolbar :editor="editor" />
      </CardHeader>
      <CardContent class="flex-1 space-y-4 overflow-y-auto scrollbar-none">
        <Editor :editor="editor" oncontextmenu="return false;" />
      </CardContent>
      <CardFooter class="flex justify-end border-t py-2">
        <p
          class="whitespace-nowrap text-sm font-medium leading-none text-muted-foreground"
        >
          Edited: Jun 12
        </p>
      </CardFooter>
    </Card>
  </div>
</template>