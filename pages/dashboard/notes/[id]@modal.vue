<script setup lang="ts">
import { Pin, PinOff, Archive, BellRing, ArrowLeft } from "lucide-vue-next";

const { id } = useParallelRoute("modal")!.params;

const modal = ref<HTMLElement>();
useFocus(modal, { initialValue: true });
onClickOutside(modal, async () => {
  useModalRouter().close();
});
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
  >
    <Card
      class="z-50 h-full w-full max-w-2xl lg:max-h-[80%]"
      ref="modal"
      tabindex="-1"
    >
      <CardHeader>
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
      </CardHeader>
      <CardContent>
        <div class="content space-y-4 overflow-y-auto scrollbar-none">
          <DashboardNoteTitleInput />
          <TiptapEditor />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.content {
  height: calc(100vh - 140px); /* Fallback for IE */
  height: calc(100dvh - 140px);
}

@media (min-width: 1024px) {
  .content {
    height: calc(100vh - 300px); /* Fallback for IE */
    height: calc(100dvh - 300px);
  }
}
</style>
