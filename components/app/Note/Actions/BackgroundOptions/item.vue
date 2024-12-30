<script setup lang="ts">
import { CheckIcon } from "lucide-vue-next";

defineProps<{
  selected?: boolean;
  option: { name: string; value: string };
}>();
</script>
<template>
  <TooltipWrapper :tooltip="capitalize(option.name)">
    <Toggle
      :pressed="selected"
      :style="{ backgroundColor: option.value }"
      :class="{ 'border-2 border-blue-500': selected }"
      class="flex size-8 cursor-pointer items-center justify-center rounded-full p-1.5 hover:border-2 hover:border-blue-500"
      @click="$emit('select')"
    >
      <CheckIcon class="size-5 text-black" v-if="selected" />
    </Toggle>
  </TooltipWrapper>
</template>
