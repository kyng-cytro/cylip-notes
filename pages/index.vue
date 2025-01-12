<script setup lang="ts">
definePageMeta({
  layout: "landing",
});
</script>
<template>
  <div class="-mt-16">
    <div class="flex items-center justify-center">
      <div class="relative isolate px-6 py-14 lg:px-8">
        <div class="max-w-2xl">
          <div
            class="hidden sm:mb-8 sm:flex sm:justify-center"
            v-motion-slide-in-top
            :duration="500"
          >
            <Badge
              class="leading-1 cursor-pointer space-x-2 rounded-full px-3 py-1 text-sm"
              variant="secondary"
              ><span class="font-normal"
                >Now Featuring AI-Enhanced Insights and Search</span
              >
              <NuxtLink class="font-semibold text-blue-400" to="/app"
                >Try It Now <span aria-hidden="true">→</span></NuxtLink
              >
            </Badge>
          </div>
          <div class="text-center">
            <h1
              class="text-4xl font-extrabold tracking-tight sm:text-5xl"
              v-motion-slide-in-top
              :duration="500"
            >
              Your Notes, But<br />
              Smarter Than Ever
            </h1>
            <p
              class="mt-6 text-lg leading-8 text-muted-foreground"
              v-motion-slide-in-top
              :duration="500"
            >
              <span class="font-semibold">Snap</span> Your Ideas,
              <span class="font-semibold">Note</span> Them Down, and Always
              <span class="font-semibold">Remember</span>.
            </p>
            <div
              class="mt-10 flex items-center justify-center gap-x-6"
              v-motion-slide-in-bottom
              :duration="500"
            >
              <Button to="/app" class="font-semibold" size="lg"
                >Get Started</Button
              >
              <Button class="space-x-1 font-semibold" variant="link" size="lg"
                ><span>Learn More</span>
                <span aria-hidden="true">→</span></Button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
