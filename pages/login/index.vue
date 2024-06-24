<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { magicLinkLoginSchema } from "@/schemas/user";
definePageMeta({
  layout: "auth",
});

const loading = ref(false);
const { signIn } = useUser();
const formSchema = toTypedSchema(magicLinkLoginSchema);

const onSubmit = async (values: Record<string, any>) => {
  loading.value = true;
  try {
    await signIn({ type: "magic-link", email: values.email });
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="-mt-16">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl font-semibold leading-8">
          Lets Get You Started
        </CardTitle>
        <CardDescription class="mt-1">
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          class="grid gap-4"
          :validation-schema="formSchema"
          @submit="onSubmit"
        >
          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="hello@example.com"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button type="submit" class="w-full font-semibold" :loading="loading">
            Sign In with Email
          </Button>
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            type="button"
            @click="signIn({ type: 'google' })"
          >
            Sign In with Google
          </Button>
        </Form>
        <div class="mt-4">
          <p class="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our
            <a
              href="/terms"
              class="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>
            and
            <a
              href="/privacy"
              class="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
