<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseDateString } from "@/lib/chrono";
import { cn } from "@/lib/utils";
import { parseDate, type DateValue } from "@internationalized/date";
import { CalendarDays } from "lucide-vue-next";

const inputString = ref("");
const value = defineModel<Date>();

const getDateValue = () => {
  const date = removeTimeElement(value.value?.toISOString());
  if (!date) return undefined;
  return parseDate(date);
};

const setDateValue = (newDate?: DateValue) => {
  if (!newDate) return;
  value.value = new Date(newDate.toString());
};

const handleInputChange = () => {
  const parsedDate = parseDateString(inputString.value);
  if (!parsedDate) return;
  value.value = parsedDate;
};

const { format } = useDateUtils();
watch(
  value,
  () => {
    if (!value.value) return;
    inputString.value = format(value.value);
  },
  { immediate: true },
);

const removeTimeElement = (iso?: string) => {
  if (!iso) return undefined;
  return iso.split("T")[0];
};

const minDate = computed(() => {
  const today = new Date();
  const value = removeTimeElement(today.toISOString());
  if (!value) return undefined;
  return parseDate(value);
});
</script>

<template>
  <ClientOnly>
    <div class="flex items-center gap-1">
      <Input
        v-model="inputString"
        @blur="handleInputChange"
        placeholder="Tomorrow at 9pm..."
        :class="
          cn(
            'h-[36px] justify-start text-left font-normal',
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
            :model-value="getDateValue()"
            @update:model-value="(x: DateValue | undefined) => setDateValue(x)"
          />
          <div class="flex items-center justify-center p-3 pt-0">
            <TimePicker v-model:date="value" />
          </div>
        </PopoverContent>
      </Popover>
    </div>
    <template #fallback>
      <div class="flex items-center gap-1">
        <Input
          class="text-muted-forground h-[36px] w-[280px] justify-start text-left font-normal"
          placeholder="Tomorrow at 9pm..."
        />
        <Button variant="outline" size="icon">
          <CalendarDays class="size-4" />
        </Button>
      </div>
    </template>
  </ClientOnly>
</template>
