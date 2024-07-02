<script setup lang="ts">
import {
  Plus,
  Pin,
  PinOff,
  Share2,
  BellRing,
  Archive,
  EllipsisVertical,
} from "lucide-vue-next";
defineProps<{
  note: {
    id: number;
    title: string;
    content: string;
    pinned?: boolean;
  };
}>();
const { layout } = storeToRefs(useLayoutStore());
const layoutStyles = computed(() => ({
  "justify-between": layout.value === "grid",
  "justify-start gap-6": layout.value === "list",
}));
</script>
<template>
  <PlusModalLink :to="`/dashboard/notes/${note.id}`">
    <Card
      class="group w-full cursor-pointer ring-blue-500 focus:outline-none focus:ring-2"
      tabindex="0"
    >
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="space-y-1.5">
            <CardTitle>{{ note.title }}</CardTitle>
            <CardDescription>{{ note.content }}</CardDescription>
          </div>
          <div
            class="invisible flex items-center justify-between text-muted-foreground group-hover:visible group-focus:visible"
          >
            <TooltipWrapper tooltip="Pin note">
              <Button variant="ghost" size="icon">
                <PinOff class="h-5 w-5 rotate-45" v-if="note.pinned" />
                <Pin class="h-5 w-5 rotate-45" v-else />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pb-2.5">
        <Skeleton class="h-32 w-full" />
      </CardContent>
      <CardFooter
        class="invisible flex items-center pb-2.5 text-muted-foreground group-hover:visible group-focus:visible"
        :class="layoutStyles"
      >
        <TooltipWrapper tooltip="Remind me later">
          <Button variant="ghost" size="icon">
            <BellRing class="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper tooltip="Archive">
          <Button variant="ghost" size="icon">
            <Archive class="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <TooltipWrapper tooltip="Share">
          <Button variant="ghost" size="icon">
            <Share2 class="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        <ClientOnly>
          <template #fallback>
            <Button variant="ghost" size="icon">
              <EllipsisVertical class="h-4 w-4" />
            </Button>
          </template>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <EllipsisVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>Make a Copy</DropdownMenuItem>
                <DropdownMenuItem>Version History</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger> Assign Group </DropdownMenuSubTrigger>
                <DropdownMenuSubContent class="p-0">
                  <Command>
                    <CommandInput placeholder="Filter group..." auto-focus />
                    <CommandList>
                      <CommandEmpty
                        class="flex flex-col items-center justify-center gap-2"
                      >
                        <span>No group with that name.</span>
                        <TooltipWrapper tooltip="Create a group with this name">
                          <Button variant="ghost" size="xs">
                            <Plus class="h-5 w-5" />
                            <span class="sr-only"
                              >Create a group with this name</span
                            >
                          </Button>
                        </TooltipWrapper>
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all-notes">All Notes</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem class="text-red-600"
                  >Delete Note</DropdownMenuItem
                >
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ClientOnly>
      </CardFooter>
    </Card>
  </PlusModalLink>
</template>
