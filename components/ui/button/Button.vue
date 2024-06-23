<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Loader2 } from "lucide-vue-next";
import { Primitive, type PrimitiveProps } from "radix-vue";
import { type ButtonVariants, buttonVariants } from ".";
import { cn } from "@/lib/utils";

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
    :as="as"
    :as-child="asChild"
    :disabled="loading"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    v-else
  >
    <template v-if="loading">
      <Loader2
        class="h-4 w-4 animate-spin"
        :class="{ 'mr-2': size !== 'icon' }"
      />
      <span v-if="size !== 'icon'">Loading...</span>
      <span class="sr-only">Loading...</span>
    </template>
    <slot v-else />
  </Primitive>
</template>
