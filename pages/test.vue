<script setup lang="ts">
const { baseUrl } = useRuntimeConfig().public;
const { data } = useEventSource(`${baseUrl}/sse2`);
</script>
<template>
  <div>
    {{ data }}
  </div>
</template>
