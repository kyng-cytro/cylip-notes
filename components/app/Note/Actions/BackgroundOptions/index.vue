<script setup lang="ts">
import { DropletOffIcon, ImageOffIcon, PaletteIcon } from "lucide-vue-next";
import type { NoteSettings } from "~/server/utils/drizzle";

const props = defineProps<{
  settings: NoteSettings | null;
}>();

defineEmits<{
  (
    e: "set-background",
    value: { type: "color" | "image"; value: string } | null,
  ): void;
}>();
const isSelected = (
  value: string | null,
  type: NoteSettings["backgroundType"] | "default",
) => {
  if (
    !props.settings ||
    !props.settings.backgroundType ||
    !props.settings.backgroundValue
  )
    return type === "default";
  return (
    props.settings.backgroundType === type &&
    props.settings.backgroundValue === value
  );
};
const { colors } = useBackgroundOptions();
const isDark = computed(() => useColorMode().value === "dark");
</script>

<template>
  <TooltipWrapper tooltip="Background options">
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
            :selected="isSelected(null, 'default')"
          />
          <template v-for="option in colors(isDark)" :key="option.name">
            <AppNoteActionsBackgroundOptionsItem
              :option="option"
              :selected="isSelected(option.name, 'color')"
              @select="
                $emit('set-background', { type: 'color', value: option.name })
              "
            />
          </template>
        </div>
        <hr class="my-2 bg-muted" />
        <!-- SVG Images -->
        <div class="flex flex-wrap gap-2 sm:justify-between">
          <template v-for="option in colors(isDark)" :key="option.name">
            <AppNoteActionsBackgroundOptionsItem
              :option="option"
              :selected="isSelected(option.name, 'image')"
              @select="
                $emit('set-background', { type: 'image', value: option.name })
              "
            />
          </template>
        </div>
      </PopoverContent>
    </Popover>
  </TooltipWrapper>
</template>
