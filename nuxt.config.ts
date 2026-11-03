// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Global styles are bundled and served as a regular CSS asset.
  css: ['~/assets/css/main.css'],

  // Avoid inlining component styles into SSR HTML on production.
  features: { inlineStyles: false },

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,

    // Только сервер. Никогда не делайте эти переменные NUXT_PUBLIC_*.
    supabaseSecretKey:
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY,

    public: {
      yandexMapsKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_KEY,

      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,

      supabasePublishableKey:
        process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,

      // VK App ID является публичным идентификатором приложения.
      vkClientId: process.env.NUXT_PUBLIC_VK_CLIENT_ID
    }
  }
})
