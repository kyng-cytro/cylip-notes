<script setup lang="ts">
import { Bell, BellDot } from "lucide-vue-next";
const { user } = useUser();
const { novu: novuEnv } = useRuntimeConfig().public;
</script>
<template>
  <ClientOnly>
    <NotificationCenterComponent
      :subscriberId="user.id"
      :applicationIdentifier="novuEnv.applicationIdentifier"
      v-slot="slot"
      v-if="user"
    >
      <Button size="icon" variant="ghost">
        <BellDot class="h-5 w-5 text-blue-400" v-if="slot.unseenCount" />
        <Bell class="h-5 w-5" v-else />
      </Button>
    </NotificationCenterComponent>
    <template #fallback>
      <Button size="icon" variant="ghost">
        <Bell class="h-5 w-5" />
      </Button>
    </template>
  </ClientOnly>
</template>
