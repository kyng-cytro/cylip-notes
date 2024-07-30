<script setup lang="ts">
const { layout } = storeToRefs(useLayoutStore());
defineProps<{
  preview?: boolean;
}>();
</script>

<template>
  <Card
    class="flex w-full max-w-sm flex-1 flex-col gap-3 px-3 py-2"
    :class="{
      'max-w-none self-start': preview,
      'min-w-32 md:min-w-[300px]': layout === 'grid',
      'max-w-none': layout === 'list',
    }"
  >
    <Skeleton class="h-32 w-full" v-if="preview" />
    <div
      class="flex items-center justify-between rounded-b-lg"
      :class="{ 'rounded-t-lg': preview }"
    >
      <Skeleton class="h-10 w-full" />
    </div>
  </Card>
</template>
