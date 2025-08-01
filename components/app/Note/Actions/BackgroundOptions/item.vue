<script setup lang="ts">
import { CheckIcon } from "lucide-vue-next";

defineProps<{
  selected?: boolean;
  option: { type: "color" | "image"; name: string; value: string };
}>();
</script>

<template>
  <TooltipWrapper :tooltip="capitalize(option.name)">
    <Toggle
      type="button"
      :pressed="selected"
      :class="[
        'relative flex size-9 cursor-pointer items-center justify-center rounded-full p-1.5 hover:border-2 hover:border-blue-500',
        selected ? 'border-2 border-blue-500' : '',
      ]"
      @click="$emit('select')"
    >
      <template v-if="option.type === 'color'">
        <div
          :style="{ backgroundColor: option.value }"
          class="absolute inset-0 rounded-full"
        ></div>
      </template>
      <template v-else-if="option.type === 'image'">
        <img
          :src="option.value"
          alt=""
          class="absolute inset-0 size-full rounded-full object-cover"
        />
      </template>
      <CheckIcon class="z-10 size-5 text-black" v-if="selected" />
    </Toggle>
  </TooltipWrapper>
</template>
