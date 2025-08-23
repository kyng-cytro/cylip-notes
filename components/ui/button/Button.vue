<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { cn } from "@/lib/utils";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
  to?: string;
  loading?: boolean;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});
</script>

<template>
  <NuxtLink
    :to="to"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    v-if="to"
  >
    <slot />
  </NuxtLink>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    v-else
  >
    <template v-if="loading">
      <Loader2
        class="h-4 w-4 animate-spin"
        :class="{ 'mr-2': size !== 'icon' }"
      />
      <span v-if="size !== 'icon'">Loading...</span>
    </template>
    <slot v-else />
  </Primitive>
</template>
