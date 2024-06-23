<script setup lang="ts">
defineProps<{
  price: string;
  onetime?: boolean;
  title: string;
  perks: string[];
  extras?: string[];
  button: {
    text: string;
    to: string;
    variant: "default" | "outline";
  };
  description: string;
}>();
</script>
<template>
  <Card class="flex h-full w-full flex-col">
    <CardHeader>
      <CardTitle class="text-2xl font-semibold leading-8">{{
        title
      }}</CardTitle>
      <CardDescription class="text-md mt-3">{{ description }}</CardDescription>
      <CardDescription class="text-md mt-4 gap-x-1 text-primary">
        <span class="text-4xl font-bold tracking-tight">${{ price }}</span>
        <span class="text-sm font-semibold leading-6" v-if="!onetime"
          >/month</span
        >
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button
        class="w-full font-semibold"
        :variant="button.variant"
        size="lg"
        >{{ button.text }}</Button
      >
    </CardContent>
    <CardFooter
      class="flex flex-col items-start justify-between gap-y-3 lg:h-52"
    >
      <ul role="list" class="mt-3 space-y-3 text-sm leading-6 lg:mt-6">
        <li class="flex gap-x-3" :key="perk" v-for="perk in perks">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-6 w-5 flex-none text-primary"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353l8.493-12.739a.75.75 0 0 1 1.04-.208Z"
              clip-rule="evenodd"
            ></path></svg
          >{{ perk }}
        </li>
      </ul>
      <ul>
        <li
          class="flex gap-x-3 text-xs text-muted-foreground"
          v-for="extra in extras"
        >
          {{ extra }}
        </li>
      </ul>
    </CardFooter>
  </Card>
</template>
