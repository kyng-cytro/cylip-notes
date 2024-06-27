import { generateId } from "lucia";
import { Resend } from "resend";

const {
  resend: { apiKey },
} = useRuntimeConfig();

const resend = new Resend(apiKey);

export const sendEmail = async ({
  to,
  html,
  text,
  subject,
  category,
}: {
  to: string;
  html: string;
  text: string;
  subject: string;
  category?: "welcome" | "sign-in";
}) => {
  const { error } = await resend.emails.send({
    from: "cylip|notes <no-reply@cylip-notes.cytro.com.ng>",
    to,
    subject,
    html,
    text,
    headers: {
      "X-Entity-Ref-ID": generateId(9),
    },
    ...(category && { tags: [{ name: "category", value: category }] }),
  });
  if (error) {
    console.error({ error });
  }
};
