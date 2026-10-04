import noteSharedTemplate from "@/emails/note-shared.vue";
import signInTemplate from "@/emails/sign-in.vue";
import { render } from "@vue-email/render";
import type { Component } from "vue";

const renderEmail = async (template: Component, props: object) => {
  const [html, text] = await Promise.all([
    render(template, props, { pretty: true }),
    render(template, props, { plainText: true }),
  ]);
  return { html, text };
};

export const renderSignInEmail = async (props: {
  name: string;
  url: string;
}) => ({
  ...(await renderEmail(signInTemplate, props)),
  subject: "Login Initiated",
});

export const renderNoteSharedEmail = async (props: {
  sharer: { name: string; email: string };
  note: { title: string };
  url: string;
}) => ({
  ...(await renderEmail(noteSharedTemplate, props)),
  subject: `${props.sharer.name} invited you to “${props.note.title}”`,
});
