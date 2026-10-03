const isSameOrigin = (origin: string | null, host: string | null) => {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export default defineEventHandler(async (event) => {
  if (import.meta.prerender) return;
  if (
    !import.meta.dev &&
    event.method !== "GET" &&
    !event.path.includes("_hub") &&
    !event.path.includes("websocket") &&
    !isSameOrigin(
      getHeader(event, "Origin") ?? null,
      getHeader(event, "Host") ?? null,
    )
  ) {
    return setResponseStatus(event, 403);
  }
  // Better Auth handles its own routes.
  if (event.path.startsWith("/api/auth/")) return;
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
