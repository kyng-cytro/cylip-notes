<script setup lang="ts">
import { Menu, X } from "lucide-vue-next";
const mobileMenuOpen = ref(false);

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>
<template>
  <header class="sticky top-0 z-50 w-full py-3">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
    >
      <!-- Logo -->
      <Logo @logo-click="closeMobileMenu" />

      <!-- Navigation -->
      <div class="hidden lg:flex lg:gap-x-12">
        <NuxtLink class="font-semibold" to="/pricing">Pricing</NuxtLink>
        <NuxtLink class="font-semibold" to="/help">Help</NuxtLink>
      </div>

      <!-- Actions -->
      <div class="hidden items-center gap-x-2 lg:flex">
        <Button>Sign In</Button>
      </div>

      <!-- Mobile menu -->
      <div class="flex lg:hidden">
        <Button
          class="px-2"
          variant="ghost"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Transition name="menu" mode="out-in">
            <X v-if="mobileMenuOpen" />
            <Menu v-else />
          </Transition>
        </Button>
      </div>
    </nav>
    <Transition name="shutter">
      <div
        class="absolute flex h-[88.4vh] w-full flex-col gap-y-3 bg-white px-6 dark:bg-slate-900 lg:hidden"
        v-if="mobileMenuOpen"
      >
        <NuxtLink
          class="flex space-y-3 rounded-md px-1.5 py-2 text-base font-medium transition-colors hover:text-foreground/80"
          active-class="bg-muted"
          to="/dashboard"
          @click="closeMobileMenu"
          >Dashboard</NuxtLink
        >
        <NuxtLink
          class="flex space-y-3 rounded-md px-1.5 py-2 text-base font-medium transition-colors hover:text-foreground/80"
          active-class="bg-muted"
          to="/pricing"
          @click="closeMobileMenu"
          >Pricing</NuxtLink
        >
        <NuxtLink
          class="flex space-y-3 rounded-md px-1.5 py-2 text-base font-medium transition-colors hover:text-foreground/80"
          active-class="bg-muted"
          to="/help"
          @click="closeMobileMenu"
          >Help</NuxtLink
        >
        <hr />
        <Button
          class="border-2 border-primary font-semibold dark:border-secondary"
          variant="outline"
          >Sign In</Button
        >
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.menu-enter-active {
  animation: scale-up-center 0.25s ease 0s 1 normal none;
}
.menu-leave-active {
  animation: scale-down-center 0.25s ease 0s 1 normal none;
}

.shutter-enter-active {
  animation: shutter-in-top 0.25s ease 0s 1 normal none;
}
.shutter-leave-active {
  animation: shutter-out-top 0.25s ease 0s 1 normal none;
}

@keyframes shutter-in-top {
  0% {
    transform: rotateX(-100deg);
    transform-origin: top;
    opacity: 0;
  }
  100% {
    transform: rotateX(0deg);
    transform-origin: top;
    opacity: 1;
  }
}
@keyframes shutter-out-top {
  0% {
    transform: rotateX(0deg);
    transform-origin: top;
    opacity: 1;
  }
  100% {
    transform: rotateX(70deg);
    transform-origin: top;
    opacity: 0;
  }
}

@keyframes scale-up-center {
  0% {
    transform: scale(0.2);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes scale-down-center {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.2);
  }
}
</style>
