import { Google } from "arctic";

const {
  google: googleEnv,
  public: { baseUrl },
} = useRuntimeConfig();

export const google = new Google(
  googleEnv.clientId,
  googleEnv.clientSecret,
  `${baseUrl}/login/google/callback`,
);
