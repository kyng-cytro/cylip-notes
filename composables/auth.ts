import type { SerializeDates } from "@/lib/types";
import type { AuthUser } from "@/server/utils/auth";

type User = SerializeDates<AuthUser>;

export const useUser = () => {
  const user = useState<User | null>("user", () => null);
  const loggedIn = user.value?.id ? true : false;
  const isPremium = user.value?.accountType === "premium" ? true : false;

  async function signIn(
    opts: { type: "google" } | { type: "magic-link"; email: string },
  ) {
    const client = useNuxtApp().$authClient;
    const { error } =
      opts.type === "google"
        ? await client.signIn.social({
            provider: "google",
            callbackURL: authRoutes.app,
          })
        : await client.signIn.magicLink({
            email: opts.email,
            callbackURL: authRoutes.app,
            errorCallbackURL: authRoutes.login,
          });
    if (error) throw new Error(error.message || "Could not sign in.");
    if (opts.type === "magic-link") await navigateTo("/login/check-email");
  }

  const getToken = async () => {
    const session = await useRequestFetch()("/api/session");
    if (!session) return "";
    return session.token;
  };

  async function logout() {
    await useNuxtApp().$authClient.signOut();
    user.value = null;
    await navigateTo(authRoutes.login);
  }

  async function updateUser(values: Record<string, string | File>) {
    const body = new FormData();
    for (const [key, value] of Object.entries(values)) {
      body.append(key, value);
    }
    const data = await $fetch("/api/user", {
      body,
      method: "PATCH",
    });
    user.value = data;
  }

  return { loggedIn, isPremium, user, signIn, logout, getToken, updateUser };
};
