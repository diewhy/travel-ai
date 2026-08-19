import {
  computed,
  onBeforeUnmount,
  onMounted
} from 'vue'

export function useAuth() {
  const { $supabase } = useNuxtApp()

  const session = useState(
    'auth-session',
    () => null
  )

  const user = useState(
    'auth-user',
    () => null
  )

  const profile = useState(
    'auth-profile',
    () => null
  )

  const authReady = useState(
    'auth-ready',
    () => false
  )

  const authError = useState(
    'auth-error',
    () => ''
  )

  let authSubscription = null

  const isAuthenticated = computed(() => {
    return Boolean(user.value)
  })

  function cleanAuthParams() {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)

    const authParams = [
      'code',
      'error',
      'error_code',
      'error_description'
    ]

    authParams.forEach((key) => {
      url.searchParams.delete(key)
    })

    const cleanUrl =
      url.pathname +
      (url.searchParams.toString()
        ? `?${url.searchParams.toString()}`
        : '') +
      url.hash

    window.history.replaceState(
      {},
      document.title,
      cleanUrl
    )
  }

  function readAuthErrorFromUrl() {
    if (typeof window === 'undefined') return ''

    const url = new URL(window.location.href)
    const hash = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    )

    return (
      url.searchParams.get('error_description') ||
      url.searchParams.get('error') ||
      hash.get('error_description') ||
      hash.get('error') ||
      ''
    )
  }

  async function handleAuthCallback() {
    if (!$supabase || typeof window === 'undefined') {
      return
    }

    const callbackError = readAuthErrorFromUrl()

    if (callbackError) {
      authError.value = decodeURIComponent(
        callbackError.replace(/\+/g, ' ')
      )

      cleanAuthParams()
      return
    }

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    if (!code) return

    const {
      data,
      error
    } = await $supabase.auth.exchangeCodeForSession(code)

    if (error) {
      authError.value = error.message
      return
    }

    session.value = data?.session || null
    user.value = data?.session?.user || null

    cleanAuthParams()
  }

  function getProviderProfileData(authUser) {
    if (!authUser) {
      return {
        displayName: '',
        avatarUrl: '',
        provider: ''
      }
    }

    const metadata =
      authUser.user_metadata || {}

    const identity =
      authUser.identities?.[0] || {}

    const identityData =
      identity.identity_data || {}

    const displayName =
      identityData.real_name ||
      identityData.name ||
      identityData.display_name ||
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      authUser.email?.split('@')[0] ||
      ''

    const avatarUrl =
      identityData.picture ||
      identityData.avatar_url ||
      metadata.picture ||
      metadata.avatar_url ||
      ''

    const provider =
      authUser.app_metadata?.provider ||
      identity.provider ||
      ''

    return {
      displayName,
      avatarUrl,
      provider
    }
  }

  async function loadProfile(userId = user.value?.id) {
    if (!$supabase || !userId) {
      profile.value = null
      return null
    }

    const { data, error } = await $supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      authError.value = error.message
      return null
    }

    if (!data || !user.value) {
      profile.value = data
      return data
    }

    const providerProfile =
      getProviderProfileData(user.value)

    const patch = {}

    if (
      providerProfile.displayName &&
      (
        !data.display_name ||
        data.display_name === 'Путешественник'
      )
    ) {
      patch.display_name =
        providerProfile.displayName
    }

    if (
      providerProfile.avatarUrl &&
      !data.avatar_url
    ) {
      patch.avatar_url =
        providerProfile.avatarUrl
    }

    if (
      providerProfile.provider &&
      (
        !data.auth_provider ||
        data.auth_provider === 'unknown'
      )
    ) {
      patch.auth_provider =
        providerProfile.provider
    }

    if (Object.keys(patch).length) {
      const {
        data: updatedProfile,
        error: updateError
      } = await $supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId)
        .select('*')
        .maybeSingle()

      if (!updateError && updatedProfile) {
        profile.value = updatedProfile
        return updatedProfile
      }

      if (updateError) {
        console.warn(
          '[Auth] Не удалось обновить профиль:',
          updateError.message
        )
      }
    }

    profile.value = data
    return data
  }

  async function initAuth() {
    authError.value = ''

    if (!$supabase) {
      session.value = null
      user.value = null
      profile.value = null
      authReady.value = true
      return
    }

    await handleAuthCallback()

    const {
      data,
      error
    } = await $supabase.auth.getSession()

    if (error) {
      authError.value = error.message
    }

    session.value = data?.session || null
    user.value = data?.session?.user || null

    if (user.value) {
      await loadProfile(user.value.id)
    }

    const {
      data: listener
    } = $supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        session.value = nextSession
        user.value = nextSession?.user || null

        if (!user.value) {
          profile.value = null
          return
        }

        const userId = user.value.id

        setTimeout(() => {
          loadProfile(userId)
        }, 0)
      }
    )

    authSubscription =
      listener?.subscription || null

    authReady.value = true
  }

  async function signInWithCustomProvider(
    provider,
    options = {}
  ) {
    authError.value = ''

    if (!$supabase) {
      const error = new Error(
        'Supabase не подключён. Проверьте переменные в .env.'
      )

      authError.value = error.message
      throw error
    }

    const redirectTo =
      options.redirectTo ||
      (
        typeof window !== 'undefined'
          ? window.location.origin
          : undefined
      )

    const {
      data,
      error
    } = await $supabase.auth.signInWithOAuth({
      provider,
      options: {
        ...options,
        redirectTo,
        skipBrowserRedirect: true
      }
    })

    if (error) {
      authError.value = error.message
      throw error
    }

    if (!data?.url) {
      const error = new Error(
        'Supabase не вернул OAuth URL для custom:yandex.'
      )

      authError.value = error.message
      throw error
    }

    if (typeof window !== 'undefined') {
      window.location.assign(data.url)
    }

    return data
  }

  async function signOut() {
    if (!$supabase) return

    const { error } =
      await $supabase.auth.signOut({
        scope: 'local'
      })

    if (error) {
      authError.value = error.message
      throw error
    }

    session.value = null
    user.value = null
    profile.value = null
  }

  async function refreshProfile() {
    return loadProfile()
  }

  onMounted(() => {
    initAuth()
  })

  onBeforeUnmount(() => {
    authSubscription?.unsubscribe()
    authSubscription = null
  })

  return {
    session,
    user,
    profile,
    authReady,
    authError,
    isAuthenticated,
    initAuth,
    loadProfile,
    refreshProfile,
    signInWithCustomProvider,
    signOut
  }
}
