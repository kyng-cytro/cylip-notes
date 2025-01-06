<script setup lang="ts">
import type { Note } from "@/server/utils/drizzle";
import { TagIcon } from "lucide-vue-next";

const props = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();

const { layout } = storeToRefs(useLayoutStore());
const { convertToHtml } = useEditorUtils();

const openModal = () => {
  useModalRouter().push(`/app/notes/${props.note.id}`);
};

const content = computed(() => {
  return convertToHtml(props.note.content);
});

const { getBackgroundOptionCode } = useBackgroundOptions();
const isDark = computed(() => useColorMode().value === "dark");
</script>
<template>
  <Card
    tabindex="0"
    class="group mb-2 flex w-full cursor-pointer break-inside-avoid flex-col gap-3 rounded-lg p-4 ring-blue-500 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2"
    :class="{
      'max-w-none': layout === 'list',
    }"
    :style="getBackgroundOptionCode(isDark, note.settings)"
    @click="openModal"
  >
    <!-- Empty note -->
    <template v-if="!note.title && !content">
      <CardTitle class="font-semibold leading-snug"> Empty note </CardTitle>
    </template>
    <template v-else>
      <!-- Header -->
      <div v-if="note.title" class="flex items-center justify-between gap-3">
        <CardTitle class="line-clamp-2 font-semibold leading-snug">{{
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
      <div
        class="line-clamp-[18] max-h-96 overflow-hidden"
        v-if="note.showPreview && content"
      >
        <p
          v-html="content"
          class="tiptap prose pointer-events-none relative max-w-none flex-1 text-sm text-primary dark:prose-invert"
        />
      </div>
    </template>
    <!-- Label & Reminder -->
    <div
      class="mt-3 flex flex-wrap items-center gap-4"
      v-if="note.label || note.reminderAt"
    >
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
      class="mt-3 flex items-center justify-between gap-3 overflow-y-auto scrollbar-none group-hover:visible group-focus:visible lg:invisible"
      @click.stop
    >
      <AppNoteActions :note="note" />
    </div>
  </Card>
</template>
