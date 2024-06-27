import type { User } from "./drizzle";

const { baseUrl } = useRuntimeConfig().public;
export const sendMagicLink = async (user: User) => {
  const token = await generateVerificationToken(user.id);
  if (!token) return;
  const url = `${baseUrl}/verify-token/${token}`;
  // if (import.meta.dev) return console.log({ url });
  const { html, text, subject } = await renderSignInEmail({
    url,
    name: user.name,
  });
  await sendEmail({ html, text, subject, to: user.email });
};
