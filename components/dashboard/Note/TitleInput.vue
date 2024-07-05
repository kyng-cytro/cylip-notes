<script setup lang="ts">
import { EllipsisVertical } from "lucide-vue-next";
const content = defineModel({ default: "" });
</script>
<template>
  <div class="relative w-full items-center">
    <Input
      id="title"
      type="text"
      placeholder="Title"
      class="border-none px-0 py-4 pr-6 text-xl font-semibold focus-visible:ring-0"
      v-model="content"
    />
    <Button
      variant="link"
      class="absolute inset-y-0 end-0 flex items-center justify-center px-0 py-4"
    >
      <EllipsisVertical class="size-5 text-muted-foreground" />
    </Button>
  </div>
</template>
