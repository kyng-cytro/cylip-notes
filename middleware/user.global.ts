export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUser();
  if (to.path.startsWith(authRoutes.login) && loggedIn.value) {
    return navigateTo(authRoutes.app);
  }
  if (to.path.startsWith(authRoutes.app) && !loggedIn.value) {
    return navigateTo({ path: authRoutes.login, query: { to: to.fullPath } });
  }
});
