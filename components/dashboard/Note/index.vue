<script setup lang="ts">
defineProps<{
  note: {
    id: number;
    title: string;
    content: string;
  };
}>();
</script>
<template>
  <Card class="w-full max-w-xs cursor-pointer">
    <CardHeader>
      <CardTitle>{{ note.title }}</CardTitle>
      <CardDescription>{{ note.content }}</CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton class="h-32 w-full" />
    </CardContent>
  </Card>
</template>
