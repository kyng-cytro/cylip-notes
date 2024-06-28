<script setup lang="ts">
import { CircleUser } from "lucide-vue-next";
const { user, logout } = useUser();
</script>
<template>
  <ClientOnly>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="secondary" size="icon" class="rounded-full">
          <NuxtImg
            :src="user.picture"
            height="1.25rem"
            width="1.25rem"
            class="h-5 w-5 rounded-full"
            v-if="user?.picture"
          />
          <CircleUser class="h-5 w-5" v-else />
          <span class="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{{ user?.name || "My Account" }}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="logout">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <template #fallback>
      <Skeleton class="h-9 w-9 rounded-full" />
    </template>
  </ClientOnly>
</template>
