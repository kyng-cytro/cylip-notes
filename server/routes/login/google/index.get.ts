import { generateCodeVerifier, generateState } from "arctic";

export default defineEventHandler(async (event) => {
  // Generate a new state and code verifier
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // Generate a new authorization URL
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "profile",
    "email",
  ]);

  // Set the state and code verifier cookies
  setCookie(event, "state", state, {
    path: "/",
    secure: !import.meta.dev,
    httpOnly: true,
    maxAge: 60 * 10,
  });
  setCookie(event, "code_verifier", codeVerifier, {
    path: "/",
    secure: !import.meta.dev,
    httpOnly: true,
    maxAge: 60 * 10,
  });

  // Redirect to the authorization URL
  return sendRedirect(event, url.toString());
});
