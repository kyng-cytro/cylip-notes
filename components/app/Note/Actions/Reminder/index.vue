<script setup lang="ts">
import { BellPlusIcon } from "lucide-vue-next";
defineProps<{
  reminderAt: string | null;
}>();
const emits = defineEmits<{
  (e: "set-reminder", value: Date | null): void;
}>();

const date = ref();
const open = ref(false);

const handleSetReminder = () => {
  emits("set-reminder", date.value || null);
  date.value = undefined;
  open.value = false;
};

const handleClearReminder = () => {
  emits("set-reminder", null);
};
</script>
<template>
  <TooltipWrapper tooltip="Remind me">
    <Popover v-model:open="open">
      <PopoverTrigger>
        <Button variant="ghost" size="xs">
          <BellPlusIcon class="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="flex flex-col gap-4">
        <AppNoteActionsReminderBadge
          :date="reminderAt"
          @clear-reminder="handleClearReminder"
        />
        <p class="text-sm">Remind me:</p>
        <AppDatePicker v-model="date" />
        <Button
          variant="ghost"
          size="xs"
          class="mt-2"
          @click="handleSetReminder"
        >
          Set Reminder
        </Button>
      </PopoverContent>
    </Popover>
  </TooltipWrapper>
</template>
