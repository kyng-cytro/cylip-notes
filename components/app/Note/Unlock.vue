<script setup lang="ts">
import { LockKeyhole } from "lucide-vue-next";

defineProps<{
  unlock: (password: string) => Promise<void>;
  reset?: (password: string) => Promise<void>;
}>();

const resetting = ref(false);
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-sm flex-col items-center gap-6 py-8 text-center"
  >
    <LockKeyhole class="text-muted-foreground size-10" />
    <div class="space-y-1">
      <h3 class="text-xl font-bold">
        {{ resetting ? "Set a new password" : "This note is locked" }}
      </h3>
      <p class="text-muted-foreground">
        {{
          resetting
            ? "The old password will stop working for everyone."
            : "Enter the password to open it."
        }}
      </p>
    </div>
    <AppNotePasswordForm
      v-if="resetting && reset"
      mode="set"
      class="w-full text-left"
      submit-text="Change password"
      :submit="reset"
    />
    <AppNotePasswordForm
      v-else
      mode="unlock"
      class="w-full text-left"
      submit-text="Unlock"
      :submit="unlock"
    />
    <Button
      v-if="reset"
      variant="link"
      size="sm"
      @click="resetting = !resetting"
    >
      {{ resetting ? "Back to unlock" : "Forgot password?" }}
    </Button>
  </div>
</template>
