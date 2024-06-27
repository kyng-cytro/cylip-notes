import { render } from "@vue-email/render";
//@ts-ignore
import welcomeTempate from "~/emails/welcome.vue";
//@ts-ignore
import signInTemplate from "~/emails/sign-in.vue";

const getHTML = (template: any, data: any) => {
  return render(template, data, {
    pretty: true,
  });
};

const getText = (template: any, data: any) => {
  return render(template, data, {
    plainText: true,
  });
};

export const renderWelcomeEmail = async (props: { name: string }) => {
  const subject = `Hi ${props.name}, Welcome to cylip|notes`;
  const html = await getHTML(welcomeTempate, props);
  const text = await getText(welcomeTempate, props);
  return { html, text, subject };
};

export const renderSignInEmail = async (props: {
  name: string;
  url: string;
}) => {
  const subject = `Login Initiated`;
  const html = await getHTML(signInTemplate, props);
  const text = await getText(signInTemplate, props);
  return { html, text, subject };
};
