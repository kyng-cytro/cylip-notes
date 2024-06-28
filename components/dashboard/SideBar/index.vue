<script setup lang="ts">
import { Notebook } from "lucide-vue-next";

const { isPremium } = useUser();
</script>
<template>
  <div class="hidden border-r bg-muted/40 lg:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <DashboardLogo class="items-center text-lg font-semibold" />
      </div>
      <div class="flex-1">
        <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
          <DashboardSideBarItem
            :icon="Notebook"
            title="Notes"
            to="/dashboard"
          />
        </nav>
      </div>
      <div class="mt-auto p-4" v-if="!isPremium">
        <DashboardUpgradeCard />
      </div>
    </div>
  </div>
</template>
