<script setup lang="ts">
const { slug } = useParallelRoute("modal")!.params;

const modal = ref<HTMLElement>();

useFocus(modal, { initialValue: true });

onClickOutside(modal, async () => {
  useModalRouter().close();
});
</script>
<template>
  <div
    class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-6 duration-200 animate-in fade-in-0"
  >
    <Card class="z-50 h-3/4 w-full max-w-xl" ref="modal" tabindex="-1">
      <CardHeader>
        <CardTitle>Note</CardTitle>
        <CardDescription>Note from modal </CardDescription>
      </CardHeader>
      <CardContent>
        {{ slug }} from modal
        <Skeleton class="h-32 w-full" />
      </CardContent>
    </Card>
  </div>
</template>
