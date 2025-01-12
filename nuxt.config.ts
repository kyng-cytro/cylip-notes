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
    "@vueuse/motion/nuxt",
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
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo-mini.svg" },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      webSocketUrl: process.env.NUXT_PUBLIC_WEB_SOCKET_URL,
      onesignal: {
        url: process.env.NUXT_PUBLIC_ONESIGNAL_URL,
        appId: process.env.NUXT_PUBLIC_ONESIGNAL_APP_ID,
        sdkUrl: process.env.NUXT_PUBLIC_ONESIGNAL_SDK_URL,
        safariWebId: process.env.NUXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
      },
      motion: {
        directives: {
          "slide-in-top": {
            initial: { opacity: 0, y: -50 },
            enter: { opacity: 1, y: 0 },
          },
          "slide-in-bottom": {
            initial: { opacity: 0, y: 50 },
            enter: { opacity: 1, y: 0 },
          },
        },
      },
    },
    task: {
      apiKey: process.env.NUXT_TASK_API_KEY,
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
    onesignal: {
      apiKey: process.env.NUXT_ONESIGNAL_API_KEY,
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/pricing": { prerender: true },
    "/login": { prerender: true },
    "/login/check-email": { prerender: true },
  },
});
