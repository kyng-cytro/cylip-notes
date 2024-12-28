<script setup lang="ts">
import { EllipsisVertical, MaximizeIcon } from "lucide-vue-next";
const text = defineModel({ default: "" });
defineProps<{
  large?: boolean;
  canOpen?: boolean;
  disabled?: boolean;
}>();
defineEmits<{
  (e: "full-screen"): void;
  (e: "delete-note"): void;
  (e: "share-note"): void;
  (e: "copy-to-clipboard"): void;
}>();
</script>
<template>
  <DropdownMenu>
    <div class="relative flex w-full items-center gap-x-2">
      <Input
        id="title"
        type="text"
        placeholder="Title"
        class="border-none px-0 text-xl font-semibold focus-visible:ring-0"
        :class="{ 'py-6': large }"
        v-model="text"
        :disabled="disabled"
      />
      <DropdownMenuTrigger>
        <Button variant="link" class="px-0">
          <EllipsisVertical class="size-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-[200px]">
        <DropdownMenuGroup>
          <DropdownMenuItem @click="$emit('full-screen')" v-if="canOpen"
            >Full Screen <MaximizeIcon class="ml-1 size-4" />
          </DropdownMenuItem>
          <DropdownMenuItem @click="$emit('share-note')" disabled>
            Share Note
          </DropdownMenuItem>
          <DropdownMenuItem @click="$emit('copy-to-clipboard')">
            Copy to Clipboard
          </DropdownMenuItem>
          <DropdownMenuItem
            class="text-red-600"
            @click="$emit('delete-note')"
            v-if="!disabled"
            >Delete Note
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </div>
  </DropdownMenu>
</template>
