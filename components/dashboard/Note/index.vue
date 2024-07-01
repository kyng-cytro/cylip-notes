<script setup lang="ts">
import {
  Plus,
  BellRing,
  Archive,
  Palette,
  EllipsisVertical,
} from "lucide-vue-next";
defineProps<{
  note: {
    id: number;
    title: string;
    content: string;
  };
}>();
</script>
<template>
  <Card
    class="group w-full cursor-pointer ring-blue-500 focus:outline-none focus:ring-2"
    tabindex="0"
  >
    <CardHeader>
      <CardTitle>{{ note.title }}</CardTitle>
      <CardDescription>{{ note.content }}</CardDescription>
    </CardHeader>
    <CardContent class="pb-2.5">
      <Skeleton class="h-32 w-full" />
    </CardContent>
    <CardFooter
      class="invisible flex items-center justify-between pb-2.5 text-muted-foreground group-hover:visible group-focus:visible"
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
      <Badge variant="secondary">
        <span>All Notes</span>
      </Badge>
      <TooltipWrapper tooltip="Change color">
        <Button variant="ghost" size="icon">
          <Palette class="h-4 w-4" />
        </Button>
      </TooltipWrapper>
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
    </CardFooter>
  </Card>
</template>
