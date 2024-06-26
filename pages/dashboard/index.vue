<script setup lang="ts">
const { user } = useUser();
</script>

<template>
  <div>
    <p>Dashboard</p>
    <p v-if="user">Currently Logged in as {{ user.name }}</p>
    <NotificationCenter />
  </div>
</template>
