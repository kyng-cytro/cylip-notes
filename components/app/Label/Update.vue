<script setup lang="ts">
import type { ClientLabel } from "@/lib/types";
import { toast } from "vue-sonner";

const props = defineProps<{
  label: ClientLabel;
}>();

const open = ref(false);
const noteStore = useNoteStore();

const initialValues = computed(() => ({
  name: props.label.name ?? "",
  options: {
    preview: props.label.options?.preview ?? true,
    background: props.label.options?.background?.value
      ? {
          type: props.label.options.background.type,
          value: props.label.options.background.value,
        }
      : undefined,
  },
}));

const onSubmit = async (values: Record<string, any>) => {
  try {
    await noteStore.methods.updateLabel(props.label.id, values);
    toast.success("Label updated successfully");
    open.value = false;
  } catch (e: any) {
    toast.error("Could not update label", {
      description: e.data?.message || e.message,
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
