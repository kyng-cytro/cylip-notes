import { Lucia } from "lucia";
import type { User } from "./drizzle";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

export function initializeLucia() {
  const adapter = new DrizzleSQLiteAdapter(
    useDrizzle(),
    tables.session,
    tables.user,
  );
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: !import.meta.dev,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        id: attributes.id,
        name: attributes.name,
        email: attributes.email,
        tokens: attributes.tokens,
        picture: attributes.picture,
        googleId: attributes.googleId,
        accountType: attributes.accountType,
      };
    },
  });
}

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: User;
  }
}
