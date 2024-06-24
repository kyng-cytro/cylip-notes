import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";

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
    const existingUser = await db
      .select()
      .from(tables.userTable)
      .where(
        or(
          eq(tables.userTable.email, googleUser.email),
          eq(tables.userTable.googleId, googleUser.sub),
        ),
      )
      .limit(1);

    // If user exists, create a session and redirect to dashboard
    if (existingUser.length > 0 && existingUser[0]) {
      const session = await lucia.createSession(existingUser[0].id, {});
      appendHeader(
        event,
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
      );
      return sendRedirect(event, "/dashboard");
    }

    // Generate a new user ID
    const userId = generateId(15);

    // Insert the user into the database
    await db.insert(tables.userTable).values({
      id: userId,
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    // Create a session and redirect to dashboard
    const session = await lucia.createSession(userId, {});
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize(),
    );
    return sendRedirect(event, "/dashboard");
  } catch (e) {
    console.error(e);
    if (e instanceof OAuth2RequestError) {
      throw createError({
        status: 400,
      });
    }
    throw createError({
      status: 500,
    });
  }
});
