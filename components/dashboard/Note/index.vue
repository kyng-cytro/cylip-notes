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
  <Card
    class="w-full cursor-pointer ring-blue-500 focus:outline-none focus:ring-2"
    tabindex="0"
  >
    <CardHeader>
      <CardTitle>{{ note.title }}</CardTitle>
      <CardDescription>{{ note.content }}</CardDescription>
    </CardHeader>
    <CardContent>
      <Skeleton class="h-32 w-full" />
    </CardContent>
  </Card>
</template>
