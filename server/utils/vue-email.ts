import signInTemplate from "@/emails/sign-in.vue";
import { render } from "@vue-email/render";

export const renderSignInEmail = async (props: {
  name: string;
  url: string;
}) => {
  const [html, text] = await Promise.all([
    render(signInTemplate, props, { pretty: true }),
    render(signInTemplate, props, { plainText: true }),
  ]);
  return { html, text, subject: "Login Initiated" };
};
