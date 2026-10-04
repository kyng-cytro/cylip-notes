import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-12-27",
  devtools: { enabled: true },
  experimental: { typedPages: true, viewTransition: false },
  future: { compatibilityVersion: 4 },
  hub: { db: "sqlite", blob: true },
  modules: [
    "@nuxt/image",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@nuxthub/core",
    "nuxt-pages-plus",
    "@nuxtjs/color-mode",
    "@vueuse/motion/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vite-pwa/nuxt",
  ],
  css: ["@/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: "",
  },
  pagesPlus: {
    namedViewsAsParallelRoutes: true,
  },
  colorMode: {
    classSuffix: "",
  },
  typescript: {
    strict: true,
    tsConfig: { exclude: ["../sync"] },
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
      viewport:
        "width=device-width, initial-scale=1, interactive-widget=resizes-content",
      meta: [
        {
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
      syncUrl: process.env.NUXT_PUBLIC_SYNC_URL,
      onesignal: {
        url: process.env.NUXT_PUBLIC_ONESIGNAL_URL,
        appId: process.env.NUXT_PUBLIC_ONESIGNAL_APP_ID,
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
    auth: {
      secret: process.env.NUXT_AUTH_SECRET,
    },
    google: {
      clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    },
    openai: {
      apiKey: process.env.NUXT_OPENAI_API_KEY,
    },
    resend: {
      apiKey: process.env.NUXT_RESEND_API_KEY,
    },
    sync: {
      url: process.env.NUXT_SYNC_URL,
      secret: process.env.NUXT_SYNC_SECRET,
    },
    onesignal: {
      apiKey: process.env.NUXT_ONESIGNAL_API_KEY,
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/pricing": { prerender: true },
    "/app": { ssr: false, prerender: true },
    "/app/**": { ssr: false },
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: false,
    client: { installPrompt: false },
    workbox: {
      navigateFallback: "/app",
      navigateFallbackAllowlist: [/^\/app(\/|$)/],
      globPatterns: ["**/*.{js,css,html,svg,png,webp,ico,woff2}"],
      globIgnores: ["screenshots/**", "push/**"],
      runtimeCaching: [
        {
          urlPattern: /\/(images|profile-pictures)\//,
          handler: "CacheFirst",
          options: {
            cacheName: "note-images",
            expiration: { maxEntries: 500 },
          },
        },
      ],
    },
  },
});
