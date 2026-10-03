<script setup lang="ts">
import type { ClientNote } from "@/lib/types";
import { CopyIcon, Share2Icon } from "lucide-vue-next";

const props = defineProps<{ note: ClientNote }>();

const noteStore = useNoteStore();
const { copy } = useCustomClipboard();
const open = ref(false);

const url = computed(
  () =>
    `${useRuntimeConfig().public.baseUrl}/public/${props.note.public ? props.note.id : "[...]"}`,
);
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger>
      <Button variant="ghost" size="xs">
        <Share2Icon class="size-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="flex flex-col gap-6 sm:w-[380px]">
      <AppNoteActionsShareMembers v-if="open" :note="note" />
      <div v-if="note.role === 'owner'" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-2 sm:justify-between">
          <div class="space-y-0.5">
            <Label class="font-semibold">Public Note</Label>
            <p class="text-muted-foreground text-sm">
              Visible to anyone with the link.
            </p>
          </div>
          <Switch
            :modelValue="note.public"
            @update:modelValue="noteStore.toggleNoteProp(note, 'public')"
          />
        </div>
        <Badge variant="secondary" class="relative w-full px-2 py-3">
          <NuxtLink
            :to="url"
            target="_blank"
            class="mr-8 w-full truncate hover:underline"
          >
            {{ url }}
          </NuxtLink>
          <Button
            size="icon"
            variant="ghost"
            :disabled="!note.public"
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
