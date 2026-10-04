<script setup lang="ts">
import { Mail } from "lucide-vue-next";

const { invites, showAll } = useInvites();
const tooltip = computed(
  () =>
    `${invites.value.length} pending invite${invites.value.length === 1 ? "" : "s"}`,
);
</script>
<template>
  <TooltipWrapper v-if="invites.length" :tooltip="tooltip">
    <Button variant="ghost" size="icon" class="relative" @click="showAll">
      <Mail class="size-4" />
      <span
        class="bg-primary text-primary-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold"
      >
        {{ invites.length }}
      </span>
      <span class="sr-only">{{ tooltip }}</span>
    </Button>
  </TooltipWrapper>
</template>
