<script setup lang="ts">
import { parseDateString } from "@/lib/chrono";
import { reminderSuggestions } from "@/lib/reminder-suggestions";
import { cn } from "@/lib/utils";
import { parseDate, type DateValue } from "@internationalized/date";
import { CalendarDays } from "lucide-vue-next";

const value = defineModel<Date>();
const inputString = ref("");
const { format } = useDateUtils();

const toDateValue = (date: Date) => parseDate(date.toISOString().slice(0, 10));

const minDate = toDateValue(new Date());
const calendarValue = computed(() =>
  value.value ? toDateValue(value.value) : undefined,
);

const selectDay = (day: DateValue | undefined) => {
  if (day) value.value = new Date(day.toString());
};

const suggestions = reminderSuggestions();

const parseInput = () => {
  const parsed = parseDateString(inputString.value);
  if (parsed) value.value = parsed;
};

watch(
  value,
  (date) => {
    if (date) inputString.value = format(date);
  },
  { immediate: true },
);
</script>

<template>
  <ClientOnly>
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-1">
        <Button
          v-for="suggestion in suggestions"
          :key="suggestion.label"
          size="xs"
          variant="secondary"
          @click="value = suggestion.date"
        >
          {{ suggestion.label }}
        </Button>
      </div>
      <div class="flex items-center gap-1">
        <Input
          v-model="inputString"
          @blur="parseInput"
          placeholder="Tomorrow at 9pm..."
          :class="
            cn(
              'h-[36px] justify-start text-left text-sm font-normal',
              !inputString && 'text-muted-foreground',
            )
          "
        />
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" size="icon" class="p-1.5">
              <CalendarDays />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-2">
            <Calendar
              initial-focus
              :min-value="minDate"
              :model-value="calendarValue"
              @update:model-value="selectDay"
            />
            <div class="flex items-center justify-center p-3 pt-0">
              <TimePicker v-model:date="value" />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <template #fallback>
      <div class="flex items-center gap-1">
        <Input
          class="text-muted-foreground h-[36px] w-[280px] justify-start text-left font-normal"
          placeholder="Tomorrow at 9pm..."
        />
        <Button variant="outline" size="icon">
          <CalendarDays class="size-4" />
        </Button>
      </div>
    </template>
  </ClientOnly>
</template>
