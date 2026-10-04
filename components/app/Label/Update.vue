<script setup lang="ts">
import type { LabelOptions } from "@/lib/sync/protocol";
import type { ClientLabel } from "@/lib/types";
import { toast } from "vue-sonner";

const props = defineProps<{
  label: ClientLabel;
}>();

const open = ref(false);
const noteStore = useNoteStore();

const initialValues = computed(() => ({
  name: props.label.name,
  options: {
    preview: props.label.options.preview,
    background: props.label.options.background?.value
      ? props.label.options.background
      : undefined,
  },
}));

const onSubmit = (values: Record<string, any>) => {
  try {
    noteStore.updateLabel(
      props.label.id,
      values as { name: string; options: LabelOptions },
    );
    toast.success("Label updated successfully");
    open.value = false;
  } catch (e: any) {
    toast.error("Could not update label", {
      description: e.message,
    });
  }
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>Edit label</DialogTitle>
        <DialogDescription>
          Update the label name and defaults for notes in this label.
        </DialogDescription>
      </DialogHeader>
      <AppLabelForm
        :key="label.id"
        :initial-values="initialValues"
        @submit="onSubmit"
        @cancel="open = false"
        submit-text="Update label"
        show-cancel
      />
    </DialogContent>
  </Dialog>
</template>
