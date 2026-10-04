<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { LockKeyholeOpen } from "lucide-vue-next";
</script>
<template>
  <Badge class="bg-red-500 dark:bg-red-300">
    <LockKeyholeOpen class="mr-2 size-4" />
    <span>Public</span>
  </Badge>
</template>
