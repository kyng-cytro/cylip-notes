export default defineNuxtPlugin(() => {
  const route = useRoute();
  const matches = preloadRoutes.some((prefix) => route.path.startsWith(prefix));
  if (!matches) return;
  const images = backgrounds
    .filter(({ type }) => type === "image")
    .map(({ light, dark }) => {
      return [light, dark];
    })
    .flat();
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
});
