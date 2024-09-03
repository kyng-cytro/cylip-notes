<script setup lang="ts">
import { EllipsisVertical, Plus, Check } from "lucide-vue-next";

defineProps<{
  labelId: string | null;
}>();

const query = ref("");
const open = ref(false);
const { labels } = storeToRefs(useNoteStore());

const emits = defineEmits<{
  (e: "copy"): void;
  (e: "share"): void;
  (e: "delete"): void;
  (e: "archive"): void;
  (e: "versions"): void;
  (e: "set-remind"): void;
  (e: "toggle-show-preview"): void;
  (e: "assign-label", labelId: string | null): void;
}>();

const assign = (labelId: string | null) => {
  emits("assign-label", labelId);
  open.value = false;
};
</script>
<template>
  <div @click.stop>
    <ClientOnly>
      <template #fallback>
        <Button variant="ghost" size="icon">
          <EllipsisVertical class="h-4 w-4" />
          <span class="sr-only">More actions</span>
          <span class="sr-only">More actions</span>
        </Button>
      </template>
      <DropdownMenu v-model:open="open">
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon">
            <EllipsisVertical class="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem @click="$emit('share')">Share</DropdownMenuItem>
            <DropdownMenuItem @click="$emit('archive')"
              >Archive</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('set-remind')"
              >Set Reminder</DropdownMenuItem
            >
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Extras</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem @click="$emit('copy')"
              >Make a Copy</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('toggle-show-preview')"
              >Toggle Preview</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('versions')"
              >Version History</DropdownMenuItem
            >
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger> Assign Label </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="p-0">
              <AppLabelAssign
                :labelId="labelId"
                :labels="labels"
                @assign-label="assign"
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem class="text-red-600" @click="$emit('delete')"
              >Delete Note</DropdownMenuItem
            >
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ClientOnly>
  </div>
</template>
