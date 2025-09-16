<script setup lang="ts">
import { SparklesIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";
const text = defineModel({ default: "" });

const { suggest } = defineProps<{
  large?: boolean;
  disabled?: boolean;
  suggest?: {
    enabled: boolean;
    fn: () => Promise<string[]>;
  };
}>();

const loading = ref(false);
const suggestions = ref<string[]>([]);

const generate = async () => {
  loading.value = true;
  try {
    const titles = await suggest?.fn();
    if (!titles || !titles.length) return;
    suggestions.value = titles;
  } catch (e: any) {
    toast.error("Failed to generate title", { description: e.data.message });
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="relative flex w-full items-center justify-between gap-x-2">
    <Input
      id="title"
      type="text"
      placeholder="Title"
      class="placeholder:text-primary border-none px-0 text-xl! font-semibold placeholder:font-normal focus-visible:ring-0 dark:bg-transparent"
      :class="{ 'py-6': large }"
      v-model="text"
      :disabled="disabled"
    />
    <TooltipWrapper tooltip="Generate Title">
      <Button
        size="icon"
        variant="ghost"
        @click="generate"
        :loading="loading"
        v-if="suggest?.enabled"
        class="transition-colors duration-300 ease-in-out"
      >
        <SparklesIcon class="size-5" />
      </Button>
    </TooltipWrapper>
  </div>
  <div v-if="suggestions.length" class="flex flex-wrap gap-2">
    <template :key="title" v-for="title in suggestions">
      <TooltipWrapper :tooltip="title">
        <Button
          size="xs"
          variant="ghost"
          @click="text = title"
          class="truncate transition-colors duration-300 ease-in-out"
        >
          <span class="rainbow-animation max-w-32 truncate">{{ title }}</span>
        </Button>
      </TooltipWrapper>
    </template>
  </div>
</template>
