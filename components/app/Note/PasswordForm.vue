<script setup lang="ts">
import { notePasswordSchema, noteUnlockSchema } from "@/schemas/note";
import type { SubmissionContext } from "vee-validate";

const props = defineProps<{
  mode: "set" | "unlock";
  submitText: string;
  submit: (password: string) => Promise<void>;
}>();

const schema = computed(() =>
  props.mode === "set" ? notePasswordSchema : noteUnlockSchema,
);

const onSubmit = async (
  values: Record<string, any>,
  { setFieldError }: SubmissionContext,
) => {
  try {
    await props.submit(values.password);
  } catch (e: any) {
    setFieldError("password", e.data?.message ?? e.message);
  }
};
</script>

<template>
  <Form
    @submit="onSubmit"
    class="grid gap-4"
    v-slot="{ isSubmitting }"
    :validation-schema="schema"
  >
    <FormField name="password" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            autocomplete="off"
            placeholder="Enter password"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="font-semibold" :loading="isSubmitting">
      {{ submitText }}
    </Button>
  </Form>
</template>
