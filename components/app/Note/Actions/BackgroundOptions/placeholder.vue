<script setup lang="ts">
defineProps<{
  label: string;
  icon: Component;
  selected?: boolean;
}>();
</script>
<template>
  <TooltipWrapper :tooltip="capitalize(label)">
    <Toggle
      :pressed="selected"
      class="size-8 rounded-full border-2 p-1.5 hover:border-blue-500"
      :class="{ 'border-blue-500': selected }"
      @click="$emit('select')"
    >
      <component :is="icon" class="size-4" />
    </Toggle>
  </TooltipWrapper>
</template>
