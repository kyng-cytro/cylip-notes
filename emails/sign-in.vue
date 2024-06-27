<script setup lang="ts">
defineProps<{ url: string; name: string }>();
import {
  Text,
  Body,
  Html,
  Head,
  Link,
  Preview,
  Heading,
  Container,
  Section,
} from "@vue-email/components";
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};
const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};
const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};
const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
</script>
<template>
  <Html>
    <Head />
    <Preview> Log in with this magic link. </Preview>
    <Body :style="main">
      <Container :style="container">
        <Section :style="{ textAlign: 'center' }">
          <Heading as="h2" :style="{ textAlign: 'center' }"
            >Cylip Notes</Heading
          >
        </Section>
        <Text :style="paragraph">Hi {{ name }},</Text>
        <Text :style="paragraph">
          This link will only be valid for the next 5 minutes. If you didn't try
          to login, you can safely ignore this email.
        </Text>
        <Section>
          <Link :href="url"> Click here to sign in </Link>
        </Section>
        <Text :style="paragraph">
          Best,
          <br />
          The Cylip Note team
        </Text>
        <Hr :style="hr" />
        <Text :style="footer"> © 2024 Cytro. All rights reserved. </Text>
      </Container>
    </Body>
  </Html>
</template>
