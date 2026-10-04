<script setup lang="ts">
import type { SlashItem } from "@/lib/tiptap/custom-extensions";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  items: SlashItem[];
  command: (item: SlashItem) => void;
}>();

const selected = ref(0);
const list = useTemplateRef("list");

watch(
  () => props.items,
  () => (selected.value = 0),
);

watch(selected, async (index) => {
  await nextTick();
  list.value?.children[index]?.scrollIntoView({ block: "nearest" });
});

const move = (step: number) => {
  const count = props.items.length;
  if (count) selected.value = (selected.value + step + count) % count;
};

const choose = (index = selected.value) => {
  const item = props.items[index];
  if (item) props.command(item);
};

const keyActions: Record<string, () => void> = {
  ArrowDown: () => move(1),
  ArrowUp: () => move(-1),
  Enter: () => choose(),
};

const onKeyDown = (event: KeyboardEvent) => {
  const action = keyActions[event.key];
  action?.();
  return !!action;
};

defineExpose({ onKeyDown });
</script>
<template>
  <div
    class="bg-popover text-popover-foreground fixed z-[60] w-64 rounded-lg border p-1 shadow-lg"
  >
    <p v-if="!items.length" class="text-muted-foreground px-2 py-1.5 text-sm">
      No blocks found
    </p>
    <ul
      v-else
      ref="list"
      class="max-h-[min(18rem,calc(var(--available-height,18rem)-0.5rem))] scrollbar-thin overflow-y-auto"
      role="listbox"
    >
      <li
        v-for="(item, index) in items"
        :key="item.id"
        role="option"
        :aria-selected="index === selected"
        class="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm"
        :class="{ 'bg-accent text-accent-foreground': index === selected }"
        @mouseenter="selected = index"
        @mousedown.prevent="choose(index)"
      >
        <span
          class="bg-background flex size-8 shrink-0 items-center justify-center rounded-md border"
        >
          <component :is="item.icon" class="size-4" />
        </span>
        {{ item.title }}
      </li>
    </ul>
  </div>
</template>
