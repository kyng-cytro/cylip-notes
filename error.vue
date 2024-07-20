<script setup lang="ts">
import { TriangleAlert } from "lucide-vue-next";
import type { NuxtError } from "#app";

const { loggedIn } = useUser();

const back = () => {
  if (loggedIn) {
    navigateTo(authRoutes.app);
  } else {
    navigateTo(authRoutes.home);
  }
};

defineProps({
  error: Object as () => NuxtError,
});
</script>

<template>
  <div class="-mt-16">
    <div class="flex h-screen items-center justify-center">
      <div class="relative isolate w-full max-w-6xl px-6 py-14 lg:px-8">
        <Card class="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle class="text-xl font-semibold leading-8">
              <TriangleAlert class="mb-2 h-8 w-8" />
              <span>Something went wrong</span>
            </CardTitle>
            <CardDescription class="mt-1 text-[0.9rem]">
              <p class="overflow-hidden">
                {{ error?.statusCode }}
                {{ error?.statusMessage || error?.message }}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button class="mt-2" variant="outline" @click="back">
              Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
