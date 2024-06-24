import { Google } from "arctic";

const {
  google: googleEnv,
  public: { baseUrl },
} = useRuntimeConfig();

export const google = new Google(
  googleEnv.clientId,
  googleEnv.clientSecret,
  new URL("login/google/callback", baseUrl).href,
);
