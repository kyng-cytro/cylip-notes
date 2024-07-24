<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
</script>
<template>
  <div class="-mt-16">
    <div class="flex items-center justify-center">
      <div class="relative isolate w-full max-w-6xl px-6 py-14 lg:px-8">
        <Card class="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle class="text-2xl font-semibold leading-8">
              Check Your Email
            </CardTitle>
            <CardDescription class="mt-1">
              Check your email to confirm your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              We've sent an email. Please check your inbox and follow the
              instructions to confirm your account.
            </p>

            <Button to="/login" class="mt-4" variant="outline">
              Back to Login
              <span class="sr-only">Back to Login</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
