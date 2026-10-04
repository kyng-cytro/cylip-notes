<script setup lang="ts">
import type { LabelOptions } from "@/lib/sync/protocol";
import { toast } from "vue-sonner";

const open = ref(false);
const { isPremium } = useUser();
const value = defineModel<string | undefined>("value", { default: undefined });

const onSubmit = (values: Record<string, any>) => {
  try {
    useNoteStore().createLabel(
      values as { name: string; options: LabelOptions },
    );
    toast.success("Label created successfully", {
      description: `A new label with the name ${values.name} has been created.`,
    });
    value.value = undefined;
    open.value = false;
  } catch (e: any) {
    toast.error("Could not create label", { description: e.message });
  }
};

const canCreateLabel = computed(
  () =>
    isPremium.value || useNoteStore().labels.length < CONSTANTS.maxFreeLabels,
);
</script>
<template>
  <Dialog :open="open" @update:open="open = $event && canCreateLabel">
    <DialogTrigger as-child>
      <div class="group relative">
        <slot name="trigger" :disabled="!canCreateLabel" />
        <Badge
          v-if="!canCreateLabel"
          class="invisible absolute -top-3 -right-1 z-10 rounded-full px-1.5 transition-all duration-300 group-hover:visible"
          >Pro</Badge
        >
      </div>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create a new label</DialogTitle>
        <DialogDescription>
          Create a new label to organize your notes.
        </DialogDescription>
      </DialogHeader>
      <AppLabelForm
        @submit="onSubmit"
        submit-text="Create Label"
        :initial-values="{ name: value, options: { preview: true } }"
      />
    </DialogContent>
  </Dialog>
</template>
