import {
  onMounted,
  ref
} from 'vue'

const STATE_KEY = 'open-russia-vk-state'
const VERIFIER_KEY = 'open-russia-vk-verifier'

export function useVkAuth() {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()

  const vkLoading = ref(false)
  const vkError = ref('')

  function getVkClientId() {
    const value = String(
      config.public.vkClientId || ''
    ).trim()

    if (!value) {
      throw new Error(
        'VK ID не настроен. Добавьте NUXT_PUBLIC_VK_CLIENT_ID в .env.'
      )
    }

    return Number(value)
  }

  function getRedirectUrl() {
    if (typeof window === 'undefined') {
      return ''
    }

    return (
      window.location.origin +
      '/api/auth/vk/callback'
    )
  }

  function randomBase64Url(byteLength = 48) {
    const bytes = new Uint8Array(byteLength)
    crypto.getRandomValues(bytes)

    let binary = ''

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  function cleanVkParams() {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)

    ;[
      'vk_code',
      'vk_device_id',
      'vk_state',
      'vk_error',
      'vk_error_description'
    ].forEach((key) => {
      url.searchParams.delete(key)
    })

    const cleanUrl =
      url.pathname +
      (
        url.searchParams.toString()
          ? `?${url.searchParams.toString()}`
          : ''
      ) +
      url.hash

    window.history.replaceState(
      {},
      document.title,
      cleanUrl
    )
  }

  async function configureVk({
    state,
    codeVerifier
  }) {
    const VKID = await import('@vkid/sdk')

    VKID.Config.init({
      app: getVkClientId(),
      redirectUrl: getRedirectUrl(),
      state,
      codeVerifier,
      scope: 'email'
    })

    return VKID
  }

  async function startVkLogin() {
    vkError.value = ''
    vkLoading.value = true

    if (typeof window === 'undefined') return

    try {
      const state = randomBase64Url(32)
      const codeVerifier = randomBase64Url(64)

      sessionStorage.setItem(
        STATE_KEY,
        state
      )

      sessionStorage.setItem(
        VERIFIER_KEY,
        codeVerifier
      )

      const VKID = await configureVk({
        state,
        codeVerifier
      })

      await VKID.Auth.login()
    } catch (error) {
      vkLoading.value = false
      vkError.value =
        error?.error_description ||
        error?.message ||
        error?.error ||
        'Не удалось открыть VK ID.'

      throw error
    }
  }

  async function createSupabaseSession(
    accessToken
  ) {
    if (!$supabase) {
      throw new Error(
        'Supabase не подключён.'
      )
    }

    const response = await $fetch(
      '/api/auth/vk/session',
      {
        method: 'POST',
        body: {
          accessToken
        }
      }
    )

    const tokenHash =
      response?.tokenHash || ''

    if (!tokenHash) {
      throw new Error(
        'Сервер не вернул токен Supabase.'
      )
    }

    const {
      data,
      error
    } = await $supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email'
    })

    if (error) {
      throw error
    }

    return data
  }

  async function handleVkCallback() {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)

    const code =
      url.searchParams.get('vk_code')

    const deviceId =
      url.searchParams.get('vk_device_id')

    const returnedState =
      url.searchParams.get('vk_state')

    const callbackError =
      url.searchParams.get(
        'vk_error_description'
      ) ||
      url.searchParams.get('vk_error')

    if (callbackError) {
      vkError.value = callbackError
      cleanVkParams()
      return
    }

    if (!code) return

    vkLoading.value = true
    vkError.value = ''

    try {
      if (!deviceId) {
        throw new Error(
          'VK ID не вернул device_id.'
        )
      }

      const savedState =
        sessionStorage.getItem(STATE_KEY) || ''

      const codeVerifier =
        sessionStorage.getItem(
          VERIFIER_KEY
        ) || ''

      if (
        !savedState ||
        !returnedState ||
        returnedState !== savedState
      ) {
        throw new Error(
          'Не удалось проверить state VK ID. Начните вход заново.'
        )
      }

      if (!codeVerifier) {
        throw new Error(
          'Потерян PKCE code_verifier. Начните вход через VK ID заново.'
        )
      }

      const VKID = await configureVk({
        state: savedState,
        codeVerifier
      })

      const tokens =
        await VKID.Auth.exchangeCode(
          code,
          deviceId,
          codeVerifier
        )

      if (!tokens?.access_token) {
        throw new Error(
          'VK ID не вернул access_token.'
        )
      }

      await createSupabaseSession(
        tokens.access_token
      )

      sessionStorage.removeItem(STATE_KEY)
      sessionStorage.removeItem(
        VERIFIER_KEY
      )

      cleanVkParams()
    } catch (error) {
      vkError.value =
        error?.data?.statusMessage ||
        error?.data?.message ||
        error?.error_description ||
        error?.message ||
        error?.error ||
        'Ошибка входа через VK ID.'

      cleanVkParams()

      console.error(
        '[VK Auth] Ошибка callback:',
        error
      )
    } finally {
      vkLoading.value = false
    }
  }

  onMounted(() => {
    handleVkCallback()
  })

  return {
    vkLoading,
    vkError,
    startVkLogin,
    handleVkCallback
  }
}
