<script setup lang="ts">
import { FingerprintPattern, LockKeyhole } from "lucide-vue-next";
import { toast } from "vue-sonner";

type Step = "passkey" | "password" | "reset";

const props = defineProps<{
  unlock: (password: string) => Promise<void>;
  reset?: (password: string) => Promise<void>;
  passkey?: {
    saved: boolean;
    canRemember: boolean;
    failed: boolean;
    unlock: () => Promise<boolean>;
    forget: () => Promise<void>;
  };
}>();

const remember = defineModel<boolean>("remember", { default: false });

const step = ref<Step>(
  props.passkey?.saved && !props.passkey.failed ? "passkey" : "password",
);
const unlockingWithPasskey = ref(false);

const copy = computed(
  () =>
    ({
      passkey: {
        title: "This note is locked",
        description: "Use your passkey to open it.",
      },
      password: {
        title: "This note is locked",
        description: props.passkey?.failed
          ? "Your passkey didn't work. Enter the password instead."
          : "Enter the password to open it.",
      },
      reset: {
        title: "Set a new password",
        description: "The old password will stop working for everyone.",
      },
    })[step.value],
);

const unlockWithPasskey = async () => {
  unlockingWithPasskey.value = true;
  const unlocked = await props.passkey!.unlock();
  unlockingWithPasskey.value = false;
  if (!unlocked) step.value = "password";
};

const forgetPasskey = async () => {
  await props.passkey!.forget();
  toast.success("Passkey removed for this note.");
};
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-sm flex-col items-center gap-6 py-8 text-center"
  >
    <LockKeyhole class="text-muted-foreground size-10" />
    <div class="space-y-1">
      <h3 class="text-xl font-bold">{{ copy.title }}</h3>
      <p class="text-muted-foreground">{{ copy.description }}</p>
    </div>
    <template v-if="step === 'passkey'">
      <Button
        class="w-full font-semibold"
        :loading="unlockingWithPasskey"
        @click="unlockWithPasskey"
      >
        <FingerprintPattern class="size-4" />
        Unlock with passkey
      </Button>
      <Button variant="link" size="sm" @click="step = 'password'">
        Use password instead
      </Button>
    </template>
    <template v-else-if="step === 'password'">
      <AppNotePasswordForm
        mode="unlock"
        class="w-full text-left"
        submit-text="Unlock"
        :submit="unlock"
      >
        <template v-if="reset" #hint>
          <Button
            type="button"
            variant="link"
            size="xs"
            class="text-muted-foreground h-auto p-0 text-xs font-light"
            @click="step = 'reset'"
          >
            Forgot password?
          </Button>
        </template>
      </AppNotePasswordForm>
      <label
        v-if="passkey?.canRemember"
        class="flex w-full items-center justify-between gap-4 text-left text-sm"
      >
        Unlock with a passkey next time
        <Switch v-model="remember" />
      </label>
      <div v-if="passkey?.saved" class="flex flex-col items-center">
        <Button variant="link" size="sm" @click="step = 'passkey'">
          Use passkey instead
        </Button>
        <Button
          variant="link"
          size="xs"
          class="text-muted-foreground h-auto text-xs font-light"
          @click="forgetPasskey"
        >
          Stop using passkey for this note
        </Button>
      </div>
    </template>
    <template v-else-if="reset">
      <AppNotePasswordForm
        mode="set"
        class="w-full text-left"
        submit-text="Change password"
        :submit="reset"
      />
      <Button variant="link" size="sm" @click="step = 'password'">
        Back to unlock
      </Button>
    </template>
  </div>
</template>
