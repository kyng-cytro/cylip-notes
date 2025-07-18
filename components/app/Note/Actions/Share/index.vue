<script setup lang="ts">
import { Share2Icon, CopyIcon } from "lucide-vue-next";
import type { NoteOptions } from "@/schemas/note";
const props = defineProps<{
  noteId: string;
  public?: NoteOptions["public"];
}>();

defineEmits<{
  (e: "set-public", value: boolean): void;
}>();

const { copy } = useCustomClipboard();

const url = computed(() => {
  return `${useRuntimeConfig().public.baseUrl}/public/${
    !props.public ? "[...]" : props.noteId
  }`;
});
</script>

<template>
  <Popover>
    <PopoverTrigger>
      <Button variant="ghost" size="xs">
        <Share2Icon class="size-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="sm:w-[350px]">
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-2 sm:justify-between">
          <div class="space-y-0.5">
            <Label class="font-semibold">Public Note</Label>
            <p class="text-sm text-muted-foreground">
              Visible to anyone with the link.
            </p>
          </div>
          <Switch
            :checked="public?.enabled"
            @update:checked="$emit('set-public', $event)"
          />
        </div>
        <Badge variant="secondary" class="relative w-full px-2 py-3">
          <NuxtLink
            :to="url"
            target="_blank"
            class="mr-8 truncate hover:underline"
            >{{ url }}</NuxtLink
          >
          <Button
            size="icon"
            variant="ghost"
            :disabled="!public"
            class="absolute right-1"
            @click="copy(url)"
          >
            <CopyIcon class="size-4" />
          </Button>
        </Badge>
      </div>
    </PopoverContent>
  </Popover>
</template>
