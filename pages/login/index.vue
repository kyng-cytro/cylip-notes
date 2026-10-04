<script setup lang="ts">
import { magicLinkLoginSchema } from "@/schemas/user";
import { toast } from "vue-sonner";
definePageMeta({
  layout: "auth",
});

const { signInWithEmail, signInWithGoogle } = useUser();
const route = useRoute();

const redirectTo = computed(() => {
  const { to } = route.query;
  return typeof to === "string" && to.startsWith(`${authRoutes.app}/`)
    ? to
    : authRoutes.app;
});

onMounted(() => {
  if (!route.query.error) return;
  toast.error("Sign in link is invalid or has expired", {
    description: "Please request a new one.",
  });
});

const withErrorToast = async (action: () => Promise<void>) => {
  try {
    await action();
  } catch (e: any) {
    toast.error("Something went wrong", { description: e.message });
  }
};

const onSubmit = (values: Record<string, any>) =>
  withErrorToast(() => signInWithEmail(values.email, redirectTo.value));
</script>

<template>
  <div class="-mt-16">
    <div class="flex items-center justify-center">
      <div class="relative isolate w-full max-w-6xl px-6 py-14 lg:px-8">
        <Card class="mx-auto max-w-sm" v-motion-slide-in-top :duration="500">
          <CardHeader>
            <CardTitle class="text-2xl leading-8 font-semibold">
              Lets Get You Started
            </CardTitle>
            <CardDescription class="mt-1">
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              class="grid gap-4"
              @submit="onSubmit"
              v-slot="{ isSubmitting }"
              :validation-schema="magicLinkLoginSchema"
            >
              <FormField name="email" v-slot="{ componentField }">
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      autocomplete="email"
                      placeholder="hello@example.com"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <Button
                type="submit"
                :loading="isSubmitting"
                class="w-full font-semibold"
              >
                Sign in with email
                <span class="sr-only">Sign in with email</span>
              </Button>
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <span class="w-full border-t" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-background text-muted-foreground px-2">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                @click="withErrorToast(() => signInWithGoogle(redirectTo))"
              >
                Google
                <span class="sr-only">Sign In with Google</span>
              </Button>
            </Form>
            <div class="mt-4">
              <p class="text-muted-foreground px-8 text-center text-sm">
                By clicking continue, you agree to our
                <a
                  href="/terms"
                  class="hover:text-primary underline underline-offset-4"
                >
                  Terms of Service
                </a>
                and
                <a
                  href="/privacy"
                  class="hover:text-primary underline underline-offset-4"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
