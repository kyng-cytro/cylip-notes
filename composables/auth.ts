import type { User } from "lucia";

export const useUser = () => {
  const user = useState<User | null>("user", () => null);
  const loggedIn = user.value?.id ? true : false;
  const isPremium = user.value?.accountType === "premium" ? true : false;

  async function signIn(
    opts: { type: "google" } | { type: "magic-link"; email: string },
  ) {
    if (opts.type === "google") {
      return await navigateTo("/login/google", { external: true });
    }
    await $fetch("/login/magic-link", {
      method: "POST",
      body: { email: opts.email },
    });
    await navigateTo("/login/check-email");
  }

  const getToken = async () => {
    const session = await useRequestFetch()("/api/session");
    if (!session) return "";
    return session.id;
  };

  async function logout() {
    await $fetch("/api/logout", {
      method: "POST",
    });
    user.value = null;
    await navigateTo(authRoutes.login);
  }

  async function updateUser(body: Record<string, string>) {
    const data = await $fetch("/api/user", {
      method: "PATCH",
      body,
    });
    user.value = data;
  }

  return { loggedIn, isPremium, user, signIn, logout, getToken, updateUser };
};
