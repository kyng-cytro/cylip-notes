<script setup lang="ts">
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@vue-email/components";

defineProps<{
  sharer: { name: string };
  note: { title: string };
  url: string;
}>();

const main = { backgroundColor: "#ffffff" };
const container = { margin: "0 auto", padding: "20px 0 48px" };
const paragraph = { fontSize: "16px", lineHeight: "26px" };
const button = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  padding: "12px 20px",
  textDecoration: "none",
};
const hr = { borderColor: "#cccccc", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px" };
</script>
<template>
  <Html>
    <Head />
    <Preview>{{ sharer.name }} shared “{{ note.title }}” with you</Preview>
    <Body :style="main">
      <Container :style="container">
        <Section :style="{ textAlign: 'center' }">
          <Heading as="h1" :style="{ textAlign: 'center' }">
            Cylip Notes
          </Heading>
        </Section>
        <Text :style="paragraph">
          {{ sharer.name }} shared the note “{{ note.title }}” with you.
        </Text>
        <Text :style="paragraph">
          Sign in with this email address to open it. If you don't have an
          account yet, signing in creates one.
        </Text>
        <Section>
          <Button :style="button" :href="url">Open note</Button>
        </Section>
        <Text :style="paragraph">
          Best,
          <br />
          The Cylip Notes team
        </Text>
        <Hr :style="hr" />
        <Text :style="footer">© 2024 Cytro. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
</template>
