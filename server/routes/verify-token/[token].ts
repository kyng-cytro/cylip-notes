import { authRoutes } from "@/utils/routes";

export default defineEventHandler(async (event) => {
  const { token } = getRouterParams(event);

  if (!token) {
    throw createError({
      statusCode: 400,
      message: "Missing token. Please provide a token.",
    });
  }
  const userId = await validateVerificationToken(token);
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: "Invalid token. Please provide a valid token.",
    });
  }
  try {
    const lucia = initializeLucia();
    await lucia.invalidateUserSessions(userId);
    const session = await lucia.createSession(userId, {});
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize(),
    );
    return sendRedirect(event, authRoutes.app);
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Internal server error. Please try again later.",
    });
  }
});
