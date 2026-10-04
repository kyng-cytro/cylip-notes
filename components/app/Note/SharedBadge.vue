<script setup lang="ts">
import type { ClientNote } from "@/lib/types";
import { Users } from "lucide-vue-next";

const { note } = defineProps<{ note: ClientNote }>();
</script>
<template>
  <Badge class="bg-sky-600 dark:bg-sky-300">
    <Users class="mr-2 size-4" />
    <span>{{ note.role === "owner" ? "Shared" : "Shared with you" }}</span>
  </Badge>
</template>
