<script setup lang="ts">
import { EllipsisVertical, MaximizeIcon } from "lucide-vue-next";

defineProps<{
  canOpen?: boolean;
  labelId: string | null;
}>();

const open = ref(false);
const { labels } = storeToRefs(useNoteStore());

const emits = defineEmits<{
  (e: "copy"): void;
  (e: "delete"): void;
  (e: "versions"): void;
  (e: "full-screen"): void;
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
        <Button variant="ghost" size="xs">
          <EllipsisVertical class="size-4" />
          <span class="sr-only">More actions</span>
        </Button>
      </template>
      <DropdownMenu v-model:open="open">
        <DropdownMenuTrigger>
          <Button variant="ghost" size="xs">
            <EllipsisVertical class="size-4" />
            <span class="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-[200px]">
          <DropdownMenuLabel>Extras</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem @click="$emit('full-screen')" v-if="canOpen"
              >Full Screen <MaximizeIcon class="ml-1 size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('versions')" disabled
              >Version History</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('toggle-show-preview')"
              >Toggle Preview</DropdownMenuItem
            >
            <DropdownMenuItem @click="$emit('copy')"
              >Copy to Clipboard</DropdownMenuItem
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
