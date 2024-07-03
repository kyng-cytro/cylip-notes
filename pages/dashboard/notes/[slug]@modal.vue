<script setup lang="ts">
import { X } from "lucide-vue-next";

const { slug } = useParallelRoute("modal")!.params;

const modal = ref<HTMLElement>();
useFocus(modal, { initialValue: true });
onClickOutside(modal, async () => {
  useModalRouter().close();
});
</script>
<template>
  <div
    class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
  >
    <Card
      class="z-50 h-full w-full max-w-2xl lg:max-h-[80%]"
      ref="modal"
      tabindex="-1"
    >
      <CardHeader>
        <div class="flex items-center justify-end">
          <Button
            class="rounded-full text-muted-foreground"
            variant="ghost"
            size="icon"
            @click="useModalRouter().close()"
          >
            <X />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex h-full flex-col gap-4">
          <Skeleton class="h-16" />
          <Skeleton class="h-96" />
          <Skeleton class="h-16" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
