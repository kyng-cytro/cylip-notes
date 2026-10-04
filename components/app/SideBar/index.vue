<script setup lang="ts">
const { isPremium } = useUser();
const { showAllNotes } = useLayoutStore();
</script>
<template>
  <div class="bg-muted/40 hidden border-r lg:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b lg:h-[60px]">
        <Logo to="/app" @logo-dblclick="showAllNotes" />
      </div>
      <div class="min-h-20 flex-1 scrollbar-thin overflow-y-auto">
        <nav class="grid items-start gap-y-2 px-2 text-sm font-medium lg:px-4">
          <AppSideBarItem
            :to="route.path"
            :key="route.path"
            :icon="route.icon"
            :title="route.name"
            v-for="route in routes"
            @dblclick="route.path === authRoutes.app && showAllNotes()"
          />
        </nav>
      </div>
      <div class="mt-auto p-4" v-if="!isPremium">
        <AppUpgradeCard />
      </div>
    </div>
  </div>
</template>
