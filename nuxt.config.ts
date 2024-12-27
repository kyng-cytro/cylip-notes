import vue from "@vitejs/plugin-vue";
export default defineNuxtConfig({
  compatibilityDate: "2024-12-27",
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
    experimental: {
      tasks: true,
      openAPI: process.env.NODE_ENV === "production",
    },
    scheduledTasks: {
      "00 00 * * *": ["notes:clear-trash"],
    },
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
      link: [{ rel: "icon", type: "image/svg+xml", href: "/logo-mini.svg" }],
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      webSocketUrl: process.env.NUXT_PUBLIC_WEB_SOCKET_URL,
    },
    google: {
      clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    },
    resend: {
      apiKey: process.env.NUXT_RESEND_API_KEY,
    },
    websocket: {
      apiKey: process.env.NUXT_WEBSOCKET_API_KEY,
    },
    serverSentEvents: {
      interval: process.env.NUXT_SERVER_SENT_EVENTS_INTERVAL,
    },
  },
  alias: {
    // HACK: not sure why i need the aliases
    // consola: "consola",
    // mime: "mime",
  },
  routeRules: {
    "/": { prerender: true },
    "/pricing": { prerender: true },
    "/login": { prerender: true },
    "/login/check-email": { prerender: true },
  },
});
