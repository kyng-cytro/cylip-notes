// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "shadcn-nuxt",
    "@nuxthub/core",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
  ],
  colorMode: {
    classSuffix: "",
  },
  experimental: { typedPages: true },
  future: { compatibilityVersion: 4 },
  hub: { database: true },
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === "development",
  },
});
