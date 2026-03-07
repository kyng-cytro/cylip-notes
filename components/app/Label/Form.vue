<script setup lang="ts">
import { labelCreateSchema } from "@/schemas/label";
import { DropletOffIcon } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    initialValues?: Record<string, any>;
    submitText?: string;
    showCancel?: boolean;
    cancelText?: string;
  }>(),
  {
    initialValues: () => ({ name: "", options: { preview: true } }),
    submitText: "Save label",
    showCancel: false,
    cancelText: "Cancel",
  },
);

const emit = defineEmits<{
  (e: "submit", values: Record<string, any>): void;
  (e: "cancel"): void;
}>();

const isDark = computed(() => useColorMode().value === "dark");
</script>

<template>
  <Form
    @submit="(values) => emit('submit', values)"
    class="grid gap-4"
    v-slot="{ isSubmitting }"
    :validation-schema="labelCreateSchema"
    :initial-values="props.initialValues"
  >
    <FormField name="name" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input
            type="text"
            autocomplete="name"
            placeholder="Enter a name"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
        <FormDescription
          >Generated slug:
          {{ slugify(componentField.modelValue ?? "") }}</FormDescription
        >
      </FormItem>
    </FormField>

    <Accordion type="single" collapsible>
      <AccordionItem key="more-options" value="more-options">
        <AccordionTrigger>More options</AccordionTrigger>
        <AccordionContent class="space-y-2">
          <FormField name="options.preview" v-slot="{ value, handleChange }">
            <FormItem
              class="flex flex-wrap items-center gap-2 rounded-lg border p-4 sm:justify-between"
            >
              <div class="space-y-0.5">
                <FormLabel class="font-semibold">Show preview</FormLabel>
                <FormDescription>
                  Show preview for notes created under this label.
                </FormDescription>
              </div>
              <FormControl>
                <Switch :modelValue="value" @update:modelValue="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>

          <FormField name="options.background" v-slot="{ value, setValue }">
            <FormItem
              class="flex flex-wrap items-center gap-2 rounded-lg border p-4 sm:justify-between"
            >
              <div class="space-y-0.5">
                <FormLabel class="font-semibold">Background</FormLabel>
                <FormDescription>
                  Select default background for notes created under this label.
                </FormDescription>
              </div>
              <FormControl>
                <div class="flex flex-wrap justify-between gap-1">
                  <AppNoteActionsBackgroundOptionsPlaceholder
                    label="no-background"
                    :icon="DropletOffIcon"
                    @select="setValue(undefined)"
                    :selected="value?.value === undefined"
                  />
                  <template
                    v-for="option in getBackgroundOptions(isDark)"
                    :key="option.name"
                  >
                    <AppNoteActionsBackgroundOptionsItem
                      :option="option"
                      :selected="value?.value === option.name"
                      @select="
                        setValue({ type: option.type, value: option.name })
                      "
                    />
                  </template>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <div class="flex items-center justify-end gap-2">
      <Button
        v-if="showCancel"
        type="button"
        variant="ghost"
        @click="emit('cancel')"
      >
        {{ cancelText }}
      </Button>
      <Button type="submit" class="font-semibold" :loading="isSubmitting">
        {{ submitText }}
      </Button>
    </div>
  </Form>
</template>
