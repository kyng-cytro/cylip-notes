// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxthub/core"],
  experimental: { typedPages: true },
  future: { compatibilityVersion: 4 },
  hub: { database: true },
  typescript: {
    strict: true,
    typeCheck: true,
  },
});
