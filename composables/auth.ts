import type { User } from "lucia";

export const useUser = () => {
  const user = useState<User | null>("user", () => null);
  const loggedIn = user.value?.id ? true : false;

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
  async function logout() {
    await $fetch("/api/logout", {
      method: "POST",
    });
    await navigateTo("/login");
  }

  return { loggedIn, user, logout, signIn };
};
