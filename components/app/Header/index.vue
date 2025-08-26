<script setup lang="ts">
import { Menu } from "lucide-vue-next";
const { isPremium } = useUser();
const mobileMenuOpen = ref(false);

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>
<template>
  <header
    class="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6"
  >
    <Sheet v-model:open="mobileMenuOpen">
      <SheetTrigger as-child>
        <Button variant="outline" size="icon" class="shrink-0 lg:hidden">
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" class="flex flex-col p-4">
        <SheetTitle class="mb-4">
          <Logo
            class="-mx-4"
            to="/app"
            no-padding
            @logo-click="closeMobileMenu"
          />
        </SheetTitle>
        <SheetDescription class="sr-only"
          >Snap, Note, Remember</SheetDescription
        >
        <nav
          class="scrollbar-thin grid min-h-20 gap-y-3 overflow-y-auto font-medium"
        >
          <AppHeaderItem
            @click="closeMobileMenu"
            v-for="route in routes"
            :key="route.path"
            :icon="route.icon"
            :title="route.name"
            :to="route.path"
          />
        </nav>
        <div class="mt-auto" v-if="!isPremium">
          <AppUpgradeCard />
        </div>
      </SheetContent>
    </Sheet>
    <div class="w-full flex-1">
      <AppHeaderSearch />
    </div>
    <div class="flex items-center gap-x-2">
      <AppHeaderFetching />
      <AppNoteLayoutSelect />
      <ColorMode />
      <AppHeaderUser />
    </div>
  </header>
</template>
