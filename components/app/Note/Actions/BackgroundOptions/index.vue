<script setup lang="ts">
import type { NoteOptions } from "@/schemas/note";
import { DropletOffIcon, PaletteIcon } from "lucide-vue-next";

const props = defineProps<{
  background: NoteOptions["background"];
}>();

defineEmits<{
  (
    e: "set-background",
    value: { type: "color" | "image"; value: string } | null,
  ): void;
}>();

const isDark = computed(() => useColorMode().value === "dark");
</script>

<template>
  <Popover>
    <PopoverTrigger>
      <Button variant="ghost" size="xs">
        <PaletteIcon class="size-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="sm:w-[450px]">
      <!-- Solid Colors -->
      <div class="flex flex-wrap gap-2 sm:justify-between">
        <AppNoteActionsBackgroundOptionsPlaceholder
          label="no-background"
          :icon="DropletOffIcon"
          @select="$emit('set-background', null)"
          :selected="props.background?.value === null"
        />
        <template
          v-for="option in getBackgroundOptions(isDark)"
          :key="option.name"
        >
          <AppNoteActionsBackgroundOptionsItem
            :option="option"
            :selected="props.background?.value === option.name"
            @select="
              $emit('set-background', { type: option.type, value: option.name })
            "
          />
        </template>
      </div>
    </PopoverContent>
  </Popover>
</template>
