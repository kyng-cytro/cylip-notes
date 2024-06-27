<script setup lang="ts">
import { Heading } from "@vue-email/components";
import { Button } from "@vue-email/components";
defineProps<{ url: string; name: string }>();
</script>
<template>
  <div>
    <Heading as="h2">Hi {{ name }},</Heading>
    <p>
      Someone (hopefully you) tried to log in to your cylip-notes account. You
      can complete your login by clicking the link below.
    </p>
    <Button :href="url">Click Here</Button>
  </div>
</template>
