<script setup lang="ts">
const { isPremium } = useUser();
const { label } = storeToRefs(useLayoutStore());
</script>
<template>
  <div class="hidden border-r bg-muted/40 lg:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b lg:h-[60px]">
        <Logo to="/app" @logo-dblclick="label = 'all-notes'" />
      </div>
      <div class="min-h-20 flex-1 overflow-y-auto scrollbar-thin">
        <nav class="grid items-start gap-y-2 px-2 text-sm font-medium lg:px-4">
          <AppSideBarItem
            v-for="route in routes"
            :key="route.path"
            :icon="route.icon"
            :title="route.name"
            :to="route.path"
          />
        </nav>
      </div>
      <div class="mt-auto p-4" v-if="!isPremium">
        <AppUpgradeCard />
      </div>
    </div>
  </div>
</template>
