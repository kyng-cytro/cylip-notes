<script setup lang="ts">
defineProps<{
  icon: Component;
  label: string;
  tooltip: string;
  active: boolean;
}>();

defineEmits<{
  (e: "toggled"): void;
}>();
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Toggle
          class="p-2"
          :aria-label="label"
          :pressed="active"
          @click="$emit('toggled')"
        >
          <component :is="icon" class="size-5" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ tooltip }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
