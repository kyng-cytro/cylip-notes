<script setup lang="ts">
import { render } from "@vue-email/render";
import signInTemplate from "@/emails/sign-in.vue";

const signIn = await render(
  signInTemplate,
  {
    url: "https://www.google.com",
    name: "John Doe",
  },
  { pretty: true },
);
</script>
<template>
  <div class="reset-tw" v-html="signIn" />
</template>

<style scoped>
.reset-tw,
.reset-tw * {
  all: revert !important;
}
</style>
