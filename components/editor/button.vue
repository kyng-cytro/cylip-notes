<script setup lang="ts">
defineProps<{
  icon: Component;
  label: string;
  tooltip: string;
  active: boolean;
  disabled?: boolean;
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
          class="p-2 text-primary"
          :aria-label="label"
          :pressed="active"
          @click="$emit('toggled')"
          :disabled="disabled"
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
