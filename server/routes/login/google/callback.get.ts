import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { authRoutes } from "~/utils/routes";

export default defineEventHandler(async (event) => {
  // Grab the code and state from the query string
  const query = getQuery(event);
  const code = query.code?.toString() ?? null;
  const state = query.state?.toString() ?? null;
  const storedState = getCookie(event, "state") ?? null;
  const storedCodeVerifier = getCookie(event, "code_verifier") ?? null;

  // Check if the state and code are valid
  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    throw createError({
      status: 400,
      message: "Authentication failed. Please try again.",
    });
  }
  try {
    // Validate the code
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // Get the user's profile information
    const googleUser = await $fetch<{
      sub: string;
      name: string;
      email: string;
      picture?: string;
    }>("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    // Init Lucia & database
    const db = useDrizzle();
    const lucia = initializeLucia();

    // Query for existing user
    const existingUser = await db.query.user.findFirst({
      where: or(
        eq(tables.user.email, googleUser.email.toLowerCase()),
        eq(tables.user.googleId, googleUser.sub),
      ),
    });

    // If user exists, create a session and redirect to App
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      appendHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
      );
      return sendRedirect(event, "/app");
    }

    // Generate a new user ID
    const userId = generateId(15);

    // Insert the user into the database
    await db.insert(tables.user).values({
      id: userId,
      googleId: googleUser.sub,
      email: googleUser.email.toLowerCase(),
      name: googleUser.name,
      picture: googleUser.picture,
      joinedVia: "google",
    });

    // Create a session and redirect to App
    const session = await lucia.createSession(userId, {});
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize(),
    );
    return sendRedirect(event, authRoutes.app);
  } catch (e) {
    console.error({ e });
    if (e instanceof OAuth2RequestError) {
      throw createError({
        status: 400,
        message: "Authentication failed. Please try again.",
      });
    }
    throw createError({
      status: 500,
      message: "Internal server error. Please try again later.",
    });
  }
});
