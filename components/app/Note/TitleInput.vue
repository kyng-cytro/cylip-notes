<script setup lang="ts">
const text = defineModel({ default: "" });
defineProps<{
  large?: boolean;
  canOpen?: boolean;
  disabled?: boolean;
}>();
</script>
<template>
  <div class="relative flex w-full items-center gap-x-2">
    <Input
      id="title"
      type="text"
      placeholder="Title"
      class="border-none px-0 text-xl font-semibold placeholder:font-normal placeholder:text-primary focus-visible:ring-0"
      :class="{ 'py-6': large }"
      v-model="text"
      :disabled="disabled"
    />
  </div>
</template>
