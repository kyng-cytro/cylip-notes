<script setup lang="ts">
definePageMeta({
  layout: "landing",
});
</script>
<template>
  <div class="-mt-16">
    <div class="flex items-center justify-center">
      <div class="relative isolate w-full max-w-6xl px-6 py-14 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
            Pricing Is Simple, As<br />
            We Put You First
          </h1>
          <p class="mt-6 text-lg leading-8 text-muted-foreground">
            Choose from <span class="font-semibold">Free</span> basics,
            <span class="font-semibold">Pro-level</span> perks, or top up on AI
            <span class="font-semibold">Tokens</span> as you go.
          </p>
        </div>
        <div
          class="mt-10 flex flex-col items-center gap-y-6 sm:justify-center sm:gap-x-6 lg:flex-row"
        >
          <LandingPriceCard
            price="0"
            title="Freeloader"
            :perks="[
              'Dark theme',
              'Unlimited notes',
              '100 AI tokens per month (enough to impress your cat)',
            ]"
            :extras="['Keep in mind this means you\'re a brokie']"
            :button="{
              text: 'Sign Up for Free',
              to: '/dashboard',
              variant: 'outline',
            }"
            description="All the basics, for free."
          />
          <LandingPriceCard
            price="9.99"
            title="Take My Money"
            :perks="[
              'Access to all basic features (yes you get dark theme too)',
              '1000 AI tokens per month (enough to look busy at work)',
            ]"
            :button="{
              text: 'Upgrade to Pro',
              to: '/dashboard/upgrade',
              variant: 'default',
            }"
            description="More tokens,  more productivity."
          />
          <LandingPriceCard
            onetime
            price="19.99"
            title="Token Junkie"
            :perks="[
              'Purchase 2000 AI tokens (because you can never have enough)',
            ]"
            :extras="['No pro subscription required (we\'re not that clingy)']"
            :button="{
              text: 'Buy Tokens',
              to: '/dashboard/buy-tokens',
              variant: 'outline',
            }"
            description="Need more tokens? We got you."
          />
        </div>
      </div>
    </div>
  </div>
</template>
