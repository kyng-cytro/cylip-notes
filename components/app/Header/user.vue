<script setup lang="ts">
const { user, logout } = useUser();
</script>
<template>
  <ClientOnly>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <div class="bg-muted flex h-7 shrink-0 items-center rounded-full pr-0">
          <span class="rainbow-animation pl-2 text-sm font-semibold">{{
            user?.tokens
          }}</span>
          <Button variant="secondary" size="icon" class="rounded-full">
            <Avatar class="size-6 rounded-full">
              <AvatarImage :src="user?.picture || ''" alt="Display Picture" />
              <AvatarFallback
                class="bg-muted text-muted-foreground font-semibold"
              >
                {{ user?.name ? getTwoChars(user.name) : "C|N" }}
              </AvatarFallback>
            </Avatar>
            <span class="sr-only">Toggle user menu</span>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel class="gap-.5 flex flex-col"
          ><span>{{ user?.name || "My Account" }}</span>
          <span class="text-muted-foreground text-xs"
            >You have
            <span class="rainbow-animation">{{ user?.tokens }}</span>
            AI tokens left</span
          >
        </DropdownMenuLabel>
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
      <Skeleton class="size-7 rounded-full" />
    </template>
  </ClientOnly>
</template>
