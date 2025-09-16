<script setup lang="ts">
defineProps<{
  tooltip: string;
}>();
</script>
<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipContent as-child>
      <p>{{ tooltip }}</p>
    </TooltipContent>
  </Tooltip>
</template>
