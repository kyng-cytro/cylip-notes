<script setup lang="ts">
import hljs from "highlight.js";
import type { Note } from "@/server/utils/drizzle";

const props = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();
const contentRef = ref<HTMLElement | null>(null);
const { layout } = storeToRefs(useLayoutStore());
const { convertToHtml } = useEditorUtils();
const { beforeEnter, enter, leave } = useHeightMotion();

const openModal = () => {
  useModalRouter().push(`/app/notes/${props.note.id}`);
};

const content = computed(() => {
  return convertToHtml(props.note.content);
});

const isDark = computed(() => useColorMode().value === "dark");
const background = computed(() => {
  if (!props.note.options?.background) return "";
  return applyBackground(isDark.value, props.note.options?.background);
});

onMounted(async () => {
  await nextTick();
  if (!contentRef.value) return;
  const blocks = contentRef.value.querySelectorAll("pre code");
  blocks.forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
});
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
    <!-- Empty note -->
    <template v-if="!note.title && !content">
      <CardTitle class="leading-snug font-semibold"> Empty note </CardTitle>
    </template>
    <template v-else>
      <!-- Header -->
      <div v-if="note.title" class="flex items-center justify-between gap-3">
        <CardTitle class="line-clamp-2 leading-snug font-semibold">{{
          note.title
        }}</CardTitle>
        <div class="group-hover:visible group-focus:visible lg:invisible">
          <AppNoteActionsPin
            :pinned="note.pinned"
            @toggle-pinned="noteStore.methods.toggleNoteProp(note, 'pinned')"
          />
        </div>
      </div>
      <!-- Content -->
      <transition
        name="content"
        mode="out-in"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
      >
        <div
          class="line-clamp-[18] max-h-96 overflow-hidden"
          v-if="note.options?.preview && content"
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
    <!-- Label, Reminder & Public -->
    <div
      class="mt-3 flex flex-wrap items-center gap-4"
      v-if="note.label || note.reminderAt || note.options?.public.enabled"
    >
      <AppNoteActionsShareBadge
        :vists="note.options.public.vists"
        v-if="note.options?.public.enabled"
      />
      <AppLabelDisplay v-if="note.label" :name="note.label.name" @click.stop />
      <AppNoteActionsReminderBadge
        v-if="note.reminderAt"
        :date="note.reminderAt"
        @clear-reminder="noteStore.methods.setReminder(note, null)"
        @click.stop
      />
    </div>
    <!-- Actions -->
    <div
      class="scrollbar-none mt-3 flex items-center justify-between gap-3 overflow-y-auto group-hover:visible group-focus:visible lg:invisible"
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
