<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
const colorMode = useColorMode();
</script>

<template>
  <ClientOnly>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost">
          <Moon
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Sun
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="colorMode.preference = 'light'">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem @click="colorMode.preference = 'dark'">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem @click="colorMode.preference = 'system'">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <template #fallback>
      <Button variant="ghost">
        <Skeleton class="h-[1.2rem] w-[1.2rem]" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </template>
  </ClientOnly>
</template>
