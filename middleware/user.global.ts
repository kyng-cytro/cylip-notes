export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUser();
  // redirect to dashboard if logged in
  if (to.path.includes("/login")) {
    if (loggedIn) return navigateTo({ path: "/dashboard" });
  }
  // redirect to login if not logged in
  if (to.path.includes("/dashboard")) {
    if (!loggedIn)
      return navigateTo({ path: "/login", query: { to: to.fullPath } });
  }
});
