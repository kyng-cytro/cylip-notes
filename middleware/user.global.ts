export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUser();
  // redirect to App if logged in
  if (to.path.includes("/login")) {
    if (loggedIn) return navigateTo({ path: "/app" });
  }
  // redirect to login if not logged in
  if (to.path.includes("/app")) {
    if (!loggedIn)
      return navigateTo({ path: "/login", query: { to: to.fullPath } });
  }
});
