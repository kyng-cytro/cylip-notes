<script setup lang="ts">
const { user, logout } = useUser();
</script>
<template>
  <ClientOnly>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="secondary" size="icon" class="rounded-full">
          <Avatar class="size-7 rounded-full">
            <AvatarImage :src="user?.picture || ''" alt="Display Picture" />
            <AvatarFallback
              class="bg-muted font-semibold text-muted-foreground"
            >
              {{ user?.name ? getTwoChars(user.name) : "C|N" }}
            </AvatarFallback>
          </Avatar>
          <span class="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{{ user?.name || "My Account" }}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem as-child>
          <NuxtLink to="/app/settings"> Settings </NuxtLink>
        </DropdownMenuItem>
        <DropdownMenuItem as-child>
          <NuxtLink to="mailto:cytro@duck.com"> Support </NuxtLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="logout">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <template #fallback>
      <Skeleton class="size-9 rounded-full" />
    </template>
  </ClientOnly>
</template>
