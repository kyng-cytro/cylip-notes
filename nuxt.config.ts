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
  app: {
    head: {
      charset: "UTF-8",
      title: "cylip|notes",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Snap, Note, Remember",
        },
      ],
    },
  },
  experimental: { typedPages: true },
  future: { compatibilityVersion: 4 },
  hub: { database: true },
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === "development",
  },
});
