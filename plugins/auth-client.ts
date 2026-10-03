import { createAuthClient } from "better-auth/vue";
import { magicLinkClient } from "better-auth/client/plugins";

export default defineNuxtPlugin(() => {
  const authClient = createAuthClient({
    baseURL: useRuntimeConfig().public.baseUrl,
    plugins: [magicLinkClient()],
  });
  return { provide: { authClient } };
});
