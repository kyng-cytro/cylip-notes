<script setup lang="ts">
import type { NoteWithUserAndLabel } from "@/server/utils/drizzle";
defineProps<{ note: NoteWithUserAndLabel }>();
const { labels } = storeToRefs(useNoteStore());
const { formatToTimeAgo } = useDateUtils();

defineEmits<{
  (e: "assign-label", labelId: string | null): void;
}>();
</script>
<template>
  <TabsContent class="space-y-4 py-3" value="note">
    <AppNoteTabsInfoItem title="Title" :value="note.title" />
    <AppNoteTabsInfoItem title="Slug" :value="note.slug" />
    <AppNoteTabsInfoItem title="Label" custom-value>
      <Popover>
        <PopoverTrigger>
          <Badge variant="secondary" class="w-fit">
            {{ capitalize(note.label?.name || "All Notes") }}</Badge
          >
        </PopoverTrigger>
        <PopoverContent class="p-0" side="right" align="start">
          <AppLabelAssign
            :labelId="note.labelId"
            :labels="labels"
            @assign-label="$emit('assign-label', $event)"
          />
        </PopoverContent>
      </Popover>
    </AppNoteTabsInfoItem>
    <AppNoteTabsInfoItem
      title="Archived"
      :value="note.archived ? 'Yes' : 'No'"
    />
    <AppNoteTabsInfoItem title="Trashed" :value="note.trashed ? 'Yes' : 'No'" />
    <AppNoteTabsInfoItem
      title="Modified"
      :value="formatToTimeAgo(note.updatedAt)"
    />
    <AppNoteTabsInfoItem title="Owner" :value="note.user.name" />
    <AppNoteTabsInfoItem
      title="Created"
      :value="formatToTimeAgo(note.createdAt)"
    />
  </TabsContent>
</template>
