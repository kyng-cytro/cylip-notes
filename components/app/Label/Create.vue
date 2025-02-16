<script setup lang="ts">
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import { labelCreateSchema } from "@/schemas/label";

const open = ref(false);
const loading = ref(false);
const value = defineModel<string | undefined>("value", { default: undefined });
const formSchema = toTypedSchema(labelCreateSchema);

const onSubmit = async (values: Record<string, any>) => {
  loading.value = true;
  try {
    await useNoteStore().methods.createLabel(values);
    toast.success("Label created successfully", {
      description: `A new label with the name ${values.name} has been created.`,
    });
    value.value = undefined;
    open.value = false;
  } catch (e: any) {
    toast.error("Could not create label", { description: e.data.message });
  } finally {
    loading.value = false;
  }
};

const { colors } = useBackgroundOptions();
const isDark = computed(() => useColorMode().value === "dark");
</script>
<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create a new label</DialogTitle>
        <DialogDescription>
          Create a new label to organize your notes.
        </DialogDescription>
      </DialogHeader>
      <Form
        v-slot="{ values }"
        class="grid gap-4"
        :validation-schema="formSchema"
        :initial-values="{ name: value }"
        @submit="onSubmit"
      >
        {{ values }}
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
              <FormField name="showPreview" v-slot="{ value, handleChange }">
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
                    <Switch :checked="value" @update:checked="handleChange" />
                  </FormControl>
                </FormItem>
              </FormField>
              <FormField name="background" v-slot="{ value, setValue }">
                <FormItem
                  class="flex flex-wrap items-center gap-2 rounded-lg border p-4 sm:justify-between"
                >
                  <div class="space-y-0.5">
                    <FormLabel class="font-semibold">Background</FormLabel>
                    <FormDescription>
                      Select default background for notes created under this
                      label.
                    </FormDescription>
                  </div>
                  <!-- Solid Colors -->
                  <FormControl>
                    <div class="flex flex-wrap justify-between gap-2">
                      <template
                        v-for="option in colors(isDark)"
                        :key="option.name"
                      >
                        <AppNoteActionsBackgroundOptionsItem
                          :option="option"
                          :selected="value?.value === option.name"
                          @select="
                            setValue({ type: 'color', value: option.name })
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
        <Button type="submit" class="font-semibold" :loading="loading">
          Create Label
        </Button>
      </Form>
    </DialogContent>
  </Dialog>
</template>
