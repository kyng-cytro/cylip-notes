import { Lucia } from "lucia";
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
  });
}

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
  }
}
