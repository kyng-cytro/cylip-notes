<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { BellRingIcon, XIcon } from "lucide-vue-next";
const { formatToTimeAgo } = useDateUtils();
defineProps<{
  date: string | null;
  noClear?: boolean;
}>();
defineEmits<{
  (e: "clear-reminder"): void;
}>();
</script>
<template>
  <Transition name="modal">
    <Badge variant="secondary" v-if="date" class="bg-black/30 pr-0">
      <BellRingIcon class="mr-2 size-4" />
      <span class="mr-2">
        {{ formatToTimeAgo(date, { sentence: true }) }}
      </span>
      <Button
        variant="ghost"
        size="xs"
        class="ml-auto"
        @click="$emit('clear-reminder')"
        v-if="!noClear"
      >
        <XIcon class="size-4" />
      </Button>
    </Badge>
  </Transition>
</template>
