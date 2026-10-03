import { APP_ROUTES } from "@/lib/sync/constants";
import type { H3Event } from "h3";

const isSameOrigin = (event: H3Event) => {
  const origin = getHeader(event, "Origin");
  const host = getHeader(event, "Host");
  if (!origin || !host) return false;
  return URL.parse(origin)?.host === host;
};

const isServerToServer = (path: string) =>
  path.startsWith(APP_ROUTES.prefix) || path.includes("_hub");

const needsOriginCheck = (event: H3Event) =>
  !import.meta.dev && event.method !== "GET" && !isServerToServer(event.path);

export default defineEventHandler(async (event) => {
  if (import.meta.prerender) return;
  if (needsOriginCheck(event) && !isSameOrigin(event)) {
    return setResponseStatus(event, 403);
  }
  if (event.path.startsWith("/api/auth/") || isServerToServer(event.path)) {
    return;
  }
  const data = await auth.api.getSession({ headers: event.headers });
  event.context.session = data?.session ?? null;
  event.context.user = data?.user ?? null;
});

declare module "h3" {
  interface H3EventContext {
    user: AuthUser | null;
    session: AuthSession | null;
  }
}
