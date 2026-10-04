<script setup lang="ts">
const { size = "default" } = defineProps<{
  icon: Component;
  label: string;
  tooltip: string;
  active: boolean;
  disabled?: boolean;
  size?: "default" | "sm";
}>();

defineEmits<{
  (e: "toggled"): void;
}>();
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Toggle
          :size="size"
          :class="size === 'sm' ? 'p-1.5' : 'p-2'"
          :aria-label="label"
          :model-value="active"
          @click="$emit('toggled')"
          :disabled="disabled"
        >
          <component :is="icon" :class="size === 'sm' ? 'size-4' : 'size-5'" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ tooltip }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
