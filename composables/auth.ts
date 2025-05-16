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
