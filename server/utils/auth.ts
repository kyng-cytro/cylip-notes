import { Lucia } from "lucia";
import type { User } from "./drizzle";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

export function initializeLucia() {
  const adapter = new DrizzleSQLiteAdapter(
    useDrizzle(),
    tables.sessionTable,
    tables.userTable,
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
        googleId: attributes.googleId,
        picture: attributes.picture,
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
