// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,

    public: {
      yandexMapsKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_KEY
    }
  }
})