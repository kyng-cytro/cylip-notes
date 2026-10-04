<script setup lang="ts">
import { isSharedNote } from "@/lib/notes";
import { contentToHtml } from "@/lib/tiptap";
import type { ClientNote } from "@/lib/types";

const props = defineProps<{
  note: ClientNote;
}>();

const noteStore = useNoteStore();
const contentRef = ref<HTMLElement | null>(null);
const { layout } = storeToRefs(useLayoutStore());
const { beforeEnter, enter, leave } = useHeightMotion();

const openModal = () => useModalRouter().push(`/app/notes/${props.note.id}`);

const content = computed(() => contentToHtml(props.note.content));

const isDark = computed(() => useColorMode().value === "dark");
const background = computed(() => {
  if (!props.note.background) return "";
  return applyBackground(isDark.value, props.note.background);
});

useCodeHighlight(contentRef, content);
</script>
<template>
  <Card
    tabindex="0"
    class="group mb-2 flex w-full cursor-pointer break-inside-avoid flex-col gap-3 rounded-lg p-4 ring-blue-500 transition-colors duration-300 ease-in-out focus:ring-2 focus:outline-none"
    :class="{
      'max-w-none': layout === 'list',
    }"
    @click="openModal"
    :style="background"
  >
    <template v-if="!note.title && !content">
      <CardTitle class="leading-snug font-semibold"> Empty note </CardTitle>
    </template>
    <template v-else>
      <div v-if="note.title" class="flex items-center justify-between gap-3">
        <CardTitle class="line-clamp-2 leading-snug font-semibold">{{
          note.title
        }}</CardTitle>
        <div class="group-hover:visible group-focus:visible lg:invisible">
          <AppNoteActionsPin
            :pinned="note.pinned"
            @toggle-pinned="noteStore.toggleNoteProp(note, 'pinned')"
          />
        </div>
      </div>
      <transition
        name="content"
        mode="out-in"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
      >
        <div
          class="line-clamp-[18] max-h-96 overflow-hidden"
          v-if="note.preview && content"
          v-motion
        >
          <p
            ref="contentRef"
            v-html="content"
            class="tiptap prose text-primary dark:prose-invert pointer-events-none relative max-w-none flex-1 text-sm"
          />
        </div>
      </transition>
    </template>
    <div
      class="mt-3 flex flex-wrap items-center gap-4"
      v-if="note.label || note.reminderAt || note.public || isSharedNote(note)"
    >
      <AppNoteActionsShareBadge v-if="note.public" />
      <AppNoteSharedBadge v-if="isSharedNote(note)" :note="note" />
      <AppLabelDisplay v-if="note.label" :name="note.label.name" @click.stop />
      <AppNoteActionsReminderBadge
        v-if="note.reminderAt"
        :date="note.reminderAt"
        @clear-reminder="noteStore.setReminder(note.id, null)"
        @click.stop
      />
    </div>
    <div
      class="mt-3 flex scrollbar-none items-center justify-between gap-3 overflow-y-auto group-hover:visible group-focus:visible lg:invisible"
      @click.stop
    >
      <AppNoteActions :note="note" />
    </div>
  </Card>
</template>

<style scoped>
.content-enter-active,
.content-leave-active {
  overflow: hidden; /* Prevent content from spilling out during animation */
}

.content-enter,
.content-leave-to {
  height: 0;
  opacity: 0;
}
</style>
