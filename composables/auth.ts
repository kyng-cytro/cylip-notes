import { SYNC_TIMING } from "@/lib/sync/constants";
import type { SerializeDates } from "@/lib/types";
import type { AuthUser } from "@/server/utils/auth";

type User = SerializeDates<AuthUser>;

const throwOnError = ({ error }: { error: { message?: string } | null }) => {
  if (error) throw new Error(error.message || "Could not sign in.");
};

export const useUser = () => {
  const user = useState<User | null>("user", () => null);
  const loggedIn = computed(() => !!user.value);
  const isPremium = computed(() => user.value?.accountType === "premium");

  const signInWithGoogle = async () => {
    const { $authClient } = useNuxtApp();
    throwOnError(
      await $authClient.signIn.social({
        provider: "google",
        callbackURL: authRoutes.app,
      }),
    );
  };

  const signInWithEmail = async (email: string) => {
    const { $authClient } = useNuxtApp();
    throwOnError(
      await $authClient.signIn.magicLink({
        email,
        callbackURL: authRoutes.app,
        errorCallbackURL: authRoutes.login,
      }),
    );
    await navigateTo("/login/check-email");
  };

  const getToken = async () => {
    const session = await $fetch<{
      token: string | null;
      userId: string | null;
    }>("/api/session", { timeout: SYNC_TIMING.tokenTimeout });
    if (session.userId !== user.value?.id) {
      reloadNuxtApp();
      throw new Error("The signed-in account changed in another tab.");
    }
    return session.token ?? "";
  };

  const logout = async () => {
    const { $authClient } = useNuxtApp();
    await useNoteStore().resetStore();
    await $authClient.signOut();
    user.value = null;
    await navigateTo(authRoutes.login);
  };

  const refreshUser = async () => {
    const data = await $fetch("/api/user");
    user.value = data ? data : null;
  };

  const updateUser = async (values: Record<string, string | File>) => {
    const body = new FormData();
    for (const [key, value] of Object.entries(values)) body.append(key, value);
    const updated = await $fetch("/api/user", { method: "PATCH", body });
    user.value = updated;
  };

  return {
    user,
    loggedIn,
    isPremium,
    signInWithGoogle,
    signInWithEmail,
    getToken,
    refreshUser,
    logout,
    updateUser,
  };
};
