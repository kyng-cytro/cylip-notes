<script setup lang="ts">
const { baseUrl } = useRuntimeConfig().public;
const { data } = useEventSource(`${baseUrl}/api/users/sse/z8d245du456t8lp`);
</script>
<template>
  <div>
    {{ data }}
  </div>
</template>
