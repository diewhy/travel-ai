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

  async function loadProfile(userId = user.value?.id) {
    if (!$supabase || !userId) {
      profile.value = null
      return null
    }

    const { data, error } = await $supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      authError.value = error.message
      return null
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
      async (_event, nextSession) => {
        session.value = nextSession
        user.value = nextSession?.user || null

        if (user.value) {
          await loadProfile(user.value.id)
        } else {
          profile.value = null
        }
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
    if (!$supabase) {
      throw new Error(
        'Supabase не настроен. Заполните переменные окружения.'
      )
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
        redirectTo
      }
    })

    if (error) {
      authError.value = error.message
      throw error
    }

    return data
  }

  async function signOut() {
    if (!$supabase) return

    const { error } =
      await $supabase.auth.signOut()

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
