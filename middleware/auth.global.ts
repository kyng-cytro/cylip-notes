const CACHE_KEY = "cylip-user";

const readCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
  } catch {
    return null;
  }
};

const cacheUser = (value: unknown) => {
  try {
    if (value) localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    else localStorage.removeItem(CACHE_KEY);
  } catch {}
};

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useUser();
  try {
    const data = await useRequestFetch()("/api/user");
    user.value = null;
    if (data) user.value = data;
    if (import.meta.client) cacheUser(user.value);
  } catch (error) {
    if (import.meta.server) throw error;
    user.value = readCachedUser();
  }
});
