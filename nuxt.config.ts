export default defineNuxtConfig({
  srcDir: 'app/',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
  },

  imports: {
    dirs: [
      'composables',
      'composables/queries',
      'composables/mutations',
      'services/api',
    ],
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
    },
  },

  app: {
    head: {
      title: 'ShopperArmy Admin',
      meta: [
        { name: 'description', content: 'ShopperArmy Admin Panel' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  compatibilityDate: '2026-02-09',
})
