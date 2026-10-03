import { HEADERS } from "@/lib/sync/constants";
import type { H3Event } from "h3";

export const requireSyncSecret = (event: H3Event) => {
  if (getHeader(event, HEADERS.syncSecret) !== useRuntimeConfig().sync.secret) {
    throw createError({ statusCode: 401, message: "Invalid sync secret." });
  }
};

export const getUserFromToken = async (token: string) => {
  const session = await useDrizzle().query.session.findFirst({
    columns: { expiresAt: true },
    where: eq(tables.session.token, token),
    with: { user: { columns: { id: true, name: true } } },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    throw createError({ statusCode: 401, message: "Invalid session." });
  }
  return session.user;
};
