export default defineNuxtPlugin(() => {
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
