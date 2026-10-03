import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { generateName } from "@/lib/name-generator";

const {
  auth: { secret },
  google,
  public: { baseUrl },
} = useRuntimeConfig();

const sendSignInLink = async (email: string, url: string) => {
  if (import.meta.dev) return console.log({ url });
  const user = await useDrizzle().query.user.findFirst({
    columns: { name: true },
    where: eq(tables.user.email, email),
  });
  const [name] = (user?.name || "there").split(" ");
  const { html, text, subject } = await renderSignInEmail({
    url,
    name: name || "there",
  });
  await sendEmail({ html, text, subject, to: email, category: "sign-in" });
};

export const auth = betterAuth({
  secret,
  baseURL: baseUrl,
  database: drizzleAdapter(useDrizzle(), {
    provider: "sqlite",
    schema: {
      user: tables.user,
      session: tables.session,
      account: tables.account,
      verification: tables.verification,
    },
  }),
  user: {
    additionalFields: {
      tokens: { type: "number", defaultValue: 100, input: false },
      accountType: {
        type: ["free", "premium"],
        defaultValue: "free",
        input: false,
      },
      joinedVia: {
        type: ["email", "google"],
        required: false,
        input: false,
      },
    },
  },
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  socialProviders: {
    google: {
      clientId: google.clientId,
      clientSecret: google.clientSecret,
      prompt: "select_account",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const viaGoogle = ctx?.path?.startsWith("/callback") ?? false;
          return {
            data: {
              ...user,
              name: user.name || generateName(user.email),
              joinedVia: viaGoogle ? "google" : "email",
            },
          };
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 5,
      sendMagicLink: ({ email, url }) => sendSignInLink(email, url),
    }),
  ],
});

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;
