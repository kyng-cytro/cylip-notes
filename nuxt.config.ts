import vue from "@vitejs/plugin-vue";
export default defineNuxtConfig({
  devtools: { enabled: true },
  experimental: { typedPages: true, viewTransition: false },
  future: { compatibilityVersion: 4 },
  hub: { database: true, cache: true },
  modules: [
    "@nuxt/image",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@nuxthub/core",
    "nuxt-pages-plus",
    "@nuxtjs/color-mode",
    "@nuxtjs/tailwindcss",
    "@pinia-plugin-persistedstate/nuxt",
  ],
  colorMode: {
    classSuffix: "",
  },
  typescript: {
    strict: true,
    typeCheck: process.env.NODE_ENV === "development",
  },
  nitro: {
    // @ts-ignore
    rollupConfig: { plugins: [vue()] },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
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
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
    google: {
      clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    },
    resend: {
      apiKey: process.env.NUXT_RESEND_API_KEY,
    },
  },
});
