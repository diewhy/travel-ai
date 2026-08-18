import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabasePublishableKey

  if (!supabaseUrl || !supabaseKey) {
    if (import.meta.dev) {
      console.warn(
        '[Supabase] NUXT_PUBLIC_SUPABASE_URL / ' +
        'NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY не заданы. ' +
        'Приложение продолжит работать без авторизации.'
      )
    }

    return {
      provide: {
        supabase: null
      }
    }
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )

  return {
    provide: {
      supabase
    }
  }
})
