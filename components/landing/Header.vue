<script setup lang="ts">
import { Menu, X } from "lucide-vue-next";
const mobileMenuOpen = ref(false);

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>
<template>
  <header
    class="sticky top-0 z-50 w-full backdrop-blur-md"
    :class="{ pattern: !mobileMenuOpen, 'bg-background': mobileMenuOpen }"
  >
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-2 lg:px-8"
    >
      <Logo @logo-click="closeMobileMenu" show-beta />
      <div class="hidden lg:flex lg:gap-x-12">
        <NuxtLink class="font-semibold" to="/pricing">Pricing</NuxtLink>
      </div>
      <div class="hidden items-center gap-x-2 lg:flex">
        <ColorMode />
        <Button to="/app" class="font-semibold">Sign In</Button>
      </div>
      <div class="flex lg:hidden">
        <ColorMode />
        <Button
          class="px-2"
          variant="ghost"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Transition name="menu" mode="out-in">
            <X v-if="mobileMenuOpen" />
            <Menu v-else />
          </Transition>

          <span class="sr-only">Toggle menu</span>
        </Button>
      </div>
    </nav>
    <Transition name="shutter">
      <div
        class="absolute flex h-[91vh] w-full flex-col gap-y-3 bg-background px-6 lg:hidden"
        v-if="mobileMenuOpen"
      >
        <NuxtLink
          class="flex space-y-3 rounded-md px-1.5 py-2 text-base font-medium transition-colors hover:text-foreground/80"
          active-class="bg-muted"
          to="/app"
          @click="closeMobileMenu"
          >Notes</NuxtLink
        >
        <NuxtLink
          class="flex space-y-3 rounded-md px-1.5 py-2 text-base font-medium transition-colors hover:text-foreground/80"
          active-class="bg-muted"
          to="/pricing"
          @click="closeMobileMenu"
          >Pricing</NuxtLink
        >
        <hr />
        <Button
          to="/app"
          class="border-2 border-primary font-semibold dark:border-secondary"
          variant="outline"
          size="lg"
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
