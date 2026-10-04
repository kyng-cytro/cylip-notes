import { Resend } from "resend";

const resend = new Resend(useRuntimeConfig().resend.apiKey);

type Email = { to: string; subject: string; html: string; text: string };

export const sendEmail = async (email: Email) => {
  const { error } = await resend.emails.send({
    from: "cylip|notes <no-reply@cylip-notes.cytro.com.ng>",
    ...email,
    headers: { "X-Entity-Ref-ID": generateId(9) },
  });
  if (error) console.error(error);
};
