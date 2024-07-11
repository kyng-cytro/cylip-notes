<script setup lang="ts">
import { toast } from "vue-sonner";
import { toTypedSchema } from "@vee-validate/zod";
import { labelCreateSchema } from "@/schemas/labels";

const open = ref(false);
const loading = ref(false);
const value = defineModel("value", { default: undefined });
const formSchema = toTypedSchema(labelCreateSchema);

const { createLabel } = useNoteStore();

const onSubmit = async (values: Record<string, any>) => {
  loading.value = true;
  try {
    await createLabel(values);
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
        class="grid gap-4"
        :validation-schema="formSchema"
        :initial-values="{ name: value }"
        @submit="onSubmit"
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

        <Button type="submit" class="font-semibold" :loading="loading">
          Create Label
        </Button>
      </Form>
    </DialogContent>
  </Dialog>
</template>
