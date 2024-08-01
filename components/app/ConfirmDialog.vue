<script setup lang="ts">
import type { ButtonVariants } from "@/components/ui/button";

defineProps<{
  title: string;
  description: string;
  buttons: {
    confirm: {
      text: string;
      variant?: ButtonVariants["variant"];
    };
    cancel: {
      text: string;
      variant?: ButtonVariants["variant"];
    };
  };
}>();

defineEmits<{
  (e: "confirm"): void;
}>();
</script>
<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription> {{ description }} </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex gap-2">
        <Button
          :variant="buttons.cancel.variant || 'destructive'"
          @click.stop="$emit('confirm')"
        >
          {{ buttons.confirm.text }}
        </Button>
        <DialogClose as-child>
          <Button :variant="buttons.cancel.variant || 'ghost'">
            {{ buttons.cancel.text }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
