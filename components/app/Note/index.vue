<script setup lang="ts">
import { Pin, PinOff } from "lucide-vue-next";
import type { Note } from "@/server/utils/drizzle";

const { note } = defineProps<{
  note: Note;
}>();

const noteStore = useNoteStore();
const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "justify-between": layout.value === "grid",
  "justify-start gap-6": layout.value === "list",
}));

const openModal = () => {
  useModalRouter().push(`/app/notes/${note.id}`);
};
</script>
<template>
  <Card
    class="group w-full cursor-pointer ring-blue-500 focus:outline-none focus:ring-2"
    tabindex="0"
    @click="openModal"
  >
    <CardHeader>
      <div class="flex items-center justify-between">
        <div class="space-y-1.5">
          <CardTitle>{{ note.title }}</CardTitle>
          <CardDescription>{{ note.content }}</CardDescription>
        </div>
        <div
          class="invisible flex items-center justify-between text-muted-foreground group-hover:visible group-focus:visible"
          v-if="!note.archived && !note.trashed"
        >
          <TooltipWrapper tooltip="Pin note">
            <Button
              variant="ghost"
              size="icon"
              @click.stop="noteStore.methods.toggleNoteProp(note, 'pinned')"
            >
              <template v-if="note.pinned">
                <PinOff class="h-5 w-5 rotate-45" />
                <span class="sr-only">Pin note</span>
              </template>
              <template v-else>
                <Pin class="h-5 w-5 rotate-45" />
                <span class="sr-only">Unpin note</span>
              </template>
            </Button>
          </TooltipWrapper>
        </div>
      </div>
    </CardHeader>
    <CardContent class="pb-2.5">
      <Skeleton class="h-32 w-full" />
    </CardContent>
    <AppNoteFooter :class="layoutStyles" v-if="!note.trashed" />
    <AppNoteFooterInactive :class="layoutStyles" v-else />
  </Card>
</template>
