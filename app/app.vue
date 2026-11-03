<script setup> 
import {ref, computed, nextTick, onMounted, onBeforeUnmount, watch} from 'vue'
import YandexMap from '~/components/YandexMap.vue'
import WelcomeScreen from '~/components/welcome/WelcomeScreen.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import ProfileDrawer from '~/components/profile/ProfileDrawer.vue'
import RouteResult from '~/components/route/RouteResult.vue'
import RouteStops from '~/components/route/RouteStops.vue'
import RouteStopModal from '~/components/route/RouteStopModal.vue'
import RoutePlanner from '~/components/planner/RoutePlanner.vue'
import HomeOverview from '~/components/home/HomeOverview.vue'
import SavedRoutes from '~/components/route/SavedRoutes.vue'
import AuthModal from '~/components/auth/AuthModal.vue'
import { useRoutes } from './composables/useRoutes.js'
import { useAudioGuide } from './composables/useAudioGuide.js'
import { useRouteProgress } from './composables/useRouteProgress.js'
import { useUserProfile } from './composables/useUserProfile.js'
import { useNavigation } from './composables/useNavigation.js'
import { useAuth } from './composables/useAuth.js'
import { useVkAuth } from './composables/useVkAuth.js'
import { cities } from '../data/cities.js'

const {
  visitedStopIds,
  routeProgressPercent,
  nextRouteStop,
  loadRouteProgress,
  bindRouteProgress,
  isStopVisited,
  markStopVisited
} = useRouteProgress()

const {
  place,
  days,
  routeDuration,
  budget,
  travelType,
  savedRoutes,
  result,
  mapPoints,
  routeStops,
  activeStop,
  currentReadyRouteId,
  history,
  memoryPlaces,
  routeTitle,
  routeAbout,
  pleinairs,
  equipment,
  routeSummary,
  mapTravelMode,
  showPlanner,
  routeMode,
  activeImageIndex,
  formattedResult,
  routeDurationName,
  currentGallery,
  activeRouteImage,
  pdfLoading,
  readyMoscowRoutes,
  openReadyMoscowRoute,
  openRouteStop,
  resetCurrentRoute,
  switchRouteMode,
  closePlanner,
  generateRoute,
  setRouteImage,
  selectDestination,
  openSavedRoute,
  deleteSavedRoute,
  downloadPdf
} = useRoutes({
  loadRouteProgress
})

bindRouteProgress({
  routeStops,
  currentReadyRouteId
})

const {
  playStopAudio,
  stopAudioGuide
} = useAudioGuide()
const {
  userProfile,
  showProfilePanel,
  profileProgressPercent,
  openProfilePanel,
  closeProfilePanel
} = useUserProfile()

const showAuthModal = ref(false)
const authLoading = ref(false)
const logoutLoading = ref(false)
const guestMode = ref(false)

const {
  user,
  profile: authProfile,
  authReady,
  authError,
  isAuthenticated,
  refreshProfile,
  signInWithCustomProvider,
  signOut
} = useAuth()

const {
  vkLoading,
  vkError,
  startVkLogin
} = useVkAuth()

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'Г'

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function setGuestProfile() {
  userProfile.value = {
    ...userProfile.value,
    name: 'Гость',
    initials: 'Г',
    avatarUrl: '',
    email: '',
    authProvider: '',
    role: 'Гостевой режим',
    level: 1,
    points: 0,
    nextLevelPoints: 600,
    routesCompleted: 0,
    tasksCompleted: 0,
    photosUploaded: 0,
    reviewsLeft: 0
  }
}

function syncAuthenticatedProfile() {
  if (!user.value) {
    setGuestProfile()
    return
  }

  const dbProfile = authProfile.value || {}
  const metadata = user.value.user_metadata || {}
  const identityData =
    user.value.identities?.[0]?.identity_data || {}

  const dbName =
    dbProfile.display_name &&
    dbProfile.display_name !== 'Путешественник'
      ? dbProfile.display_name
      : ''

  const name =
    dbName ||
    identityData.real_name ||
    identityData.name ||
    identityData.display_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.value.email?.split('@')[0] ||
    'Путешественник'

  const avatarUrl =
    dbProfile.avatar_url ||
    identityData.picture ||
    identityData.avatar_url ||
    metadata.picture ||
    metadata.avatar_url ||
    ''

  const email =
    user.value.email ||
    identityData.email ||
    metadata.email ||
    ''

  const rawProvider =
    dbProfile.auth_provider ||
    user.value.app_metadata?.provider ||
    user.value.identities?.[0]?.provider ||
    ''

  const providerText =
    String(rawProvider).toLowerCase()

  const authProvider =
    providerText.includes('yandex')
      ? 'Яндекс ID'
      : providerText.includes('vk')
        ? 'VK ID'
        : rawProvider || 'OAuth'

  const level = Number(dbProfile.level || 1)

  userProfile.value = {
    ...userProfile.value,
    name,
    initials: getInitials(name),
    avatarUrl,
    email,
    authProvider,
    role: 'Участник проекта',
    level,
    points: Number(dbProfile.points || 0),
    nextLevelPoints: Math.max(600, level * 600),
    routesCompleted: Number(dbProfile.routes_completed || 0),
    tasksCompleted: Number(dbProfile.tasks_completed || 0),
    photosUploaded: Number(dbProfile.photos_uploaded || 0),
    reviewsLeft: Number(dbProfile.reviews_left || 0)
  }
}

setGuestProfile()

watch(
  [user, authProfile],
  () => {
    syncAuthenticatedProfile()
  },
  { immediate: true }
)

const {
  showWelcomeScreen,
  enterPlatform,
  enterPlatformWithRoute,
  sidebarHome,
  sidebarRoutes,
  sidebarCreateRoute,
  sidebarMap,
  sidebarArt,
  sidebarProfile: openSidebarProfile
} = useNavigation({
  showPlanner,
  routeMode,
  place,
  result,
  mapPoints,
  openReadyMoscowRoute,
  switchRouteMode,
  closeProfilePanel,
  openProfilePanel
})

const cityGroups = cities

function handleEnterPlatform() {
  if (!authReady.value) return

  if (isAuthenticated.value || guestMode.value) {
    enterPlatform()
    return
  }

  showAuthModal.value = true
}

async function handleGuestEntry() {
  guestMode.value = true
  showAuthModal.value = false
  setGuestProfile()

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'open-russia-guest-mode',
      '1'
    )
  }

  await enterPlatform()
}

function showHistoryMode() {
  switchRouteMode('history')
  showPlanner.value = false
  place.value = ''
}

function showArtMode() {
  switchRouteMode('moscowArt')
  showPlanner.value = true
  place.value = ''
}

function handleRouteModeChange(mode) {
  switchRouteMode(mode)
  showPlanner.value = true
  place.value = ''
}

function handleSidebarProfile() {
  if (!isAuthenticated.value) {
    showAuthModal.value = true
    return
  }

  openSidebarProfile()
}

function handleCommunityAuth() {
  if (typeof window !== 'undefined') {
    if (currentReadyRouteId.value) {
      localStorage.setItem(
        'open-russia-community-route',
        currentReadyRouteId.value
      )
    }

    if (activeStop.value?.name) {
      localStorage.setItem(
        'open-russia-community-stop',
        activeStop.value.name
      )
    }
  }

  showAuthModal.value = true
}

async function handleCommunityProfileChanged() {
  try {
    await refreshProfile()
  } catch (error) {
    console.warn(
      '[Community] Не удалось обновить профиль:',
      error
    )
  }
}

async function handleSignOut() {
  if (logoutLoading.value) return

  logoutLoading.value = true

  try {
    await signOut()

    if (typeof window !== 'undefined') {
      localStorage.removeItem(
        'open-russia-auth-intent'
      )
      localStorage.removeItem(
        'open-russia-guest-mode'
      )
    }

    closeProfilePanel()
    showAuthModal.value = false
    guestMode.value = false
    setGuestProfile()
    showWelcomeScreen.value = true

    await nextTick()

    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  } catch (error) {
    console.error(
      '[Auth] Ошибка выхода:',
      error
    )
  } finally {
    logoutLoading.value = false
  }
}

async function signInWithVk() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'open-russia-auth-intent',
        'enter'
      )
    }

    await startVkLogin()
  } catch (error) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(
        'open-russia-auth-intent'
      )
    }

    console.error(
      '[Auth] Ошибка входа через VK:',
      error
    )
  }
}

watch(
  vkError,
  (value) => {
    if (value) {
      showAuthModal.value = true
    }
  }
)

async function signInWithYandex() {
  authLoading.value = true

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'open-russia-auth-intent',
        'enter'
      )
    }

    await signInWithCustomProvider(
      'custom:yandex',
      {
        redirectTo:
          typeof window !== 'undefined'
            ? window.location.origin
            : undefined
      }
    )
  } catch (error) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(
        'open-russia-auth-intent'
      )
    }

    console.error(
      '[Auth] Ошибка входа через Яндекс:',
      error
    )

    authLoading.value = false
  }
}

watch(
  [authReady, isAuthenticated],
  async ([ready, authenticated]) => {
    if (!ready || typeof window === 'undefined') return

    if (authenticated) {
      guestMode.value = false
      localStorage.removeItem(
        'open-russia-guest-mode'
      )

      syncAuthenticatedProfile()

      const intent = localStorage.getItem(
        'open-russia-auth-intent'
      )

      if (intent === 'enter') {
        localStorage.removeItem(
          'open-russia-auth-intent'
        )

        const communityRoute =
          localStorage.getItem(
            'open-russia-community-route'
          ) || ''

        const communityStop =
          localStorage.getItem(
            'open-russia-community-stop'
          ) || ''

        localStorage.removeItem(
          'open-russia-community-route'
        )
        localStorage.removeItem(
          'open-russia-community-stop'
        )

        showAuthModal.value = false
        authLoading.value = false
        await enterPlatform()

        if (communityRoute) {
          await openReadyMoscowRoute(
            communityRoute
          )

          if (communityStop) {
            const stop = routeStops.value.find(
              (item) =>
                item.name === communityStop
            )

            if (stop) {
              activeStop.value = stop
            }
          }
        }
      }

      // Если OAuth вернул пользователя с действующей сессией, но
      // маркер входа не сохранился, всё равно открываем платформу.
      // Это также позволяет не показывать экран входа при повторном визите.
      if (intent !== 'enter' && showWelcomeScreen.value) {
        showAuthModal.value = false
        authLoading.value = false
        await enterPlatform()
      }

      return
    }

    if (
      localStorage.getItem(
        'open-russia-guest-mode'
      ) === '1'
    ) {
      guestMode.value = true
      showAuthModal.value = false
      enterPlatform()
    }
  },
  { immediate: true }
)

function startCurrentRoute() {
  if (!nextRouteStop.value) return
  openRouteStop(nextRouteStop.value)
}

function closeRouteStop() {
  activeStop.value = null
  stopAudioGuide()
}

</script>

<template>
  <div class="page">
    <WelcomeScreen
      v-if="showWelcomeScreen"
      :guest-mode="guestMode"
      @enter="handleEnterPlatform"
      @preview="enterPlatformWithRoute"
    />

    <template v-else>
      <AppSidebar
        :user-profile="userProfile"
        @home="sidebarHome"
        @routes="sidebarRoutes"
        @map="sidebarMap"
        @create-route="sidebarCreateRoute"
        @art="sidebarArt"
        @profile="handleSidebarProfile"
      />

      <ProfileDrawer
        v-if="showProfilePanel"
        :user-profile="userProfile"
        :progress-percent="profileProgressPercent"
        :logout-loading="logoutLoading"
        @close="closeProfilePanel"
        @logout="handleSignOut"
      />

      <main class="new-home">
        <HomeOverview
          :route-mode="routeMode"
          :show-planner="showPlanner"
          :ready-routes="readyMoscowRoutes"
          @show-history="showHistoryMode"
          @show-planner="showPlanner = true"
          @show-art="showArtMode"
          @open-route="openReadyMoscowRoute"
        />

        <RoutePlanner
          v-if="showPlanner"
          :route-mode="routeMode"
          :route-title="routeTitle"
          :place="place"
          :route-duration="routeDuration"
          :days="days"
          :budget="budget"
          :city-groups="cityGroups"
          @close="closePlanner"
          @update:route-mode="handleRouteModeChange"
          @update:place="place = $event"
          @update:route-duration="routeDuration = $event"
          @update:days="days = $event"
          @update:budget="budget = $event"
          @generate="generateRoute"
        />
      </main>

      <RouteResult
        v-if="result"
        :route-mode="routeMode"
        :route-title="routeTitle"
        :route-about="routeAbout"
        :place="place"
        :days="days"
        :route-duration-name="routeDurationName"
        :route-points-count="routeStops.length || mapPoints.length"
        :map-travel-mode="mapTravelMode"
        :active-route-image="activeRouteImage"
        :current-gallery="currentGallery"
        :active-image-index="activeImageIndex"
        :history="history"
        :memory-places="memoryPlaces"
        :pleinairs="pleinairs"
        :formatted-result="formattedResult"
        :show-generated-text="!currentReadyRouteId"
        :pdf-loading="pdfLoading"
        @select-image="setRouteImage"
        @download-pdf="downloadPdf"
      />

      <YandexMap
        v-if="result && mapPoints.length"
        :key="routeTitle + '-' + mapPoints.length"
        :place="place"
        :points="mapPoints"
        :travel-mode="mapTravelMode"
        @select-point="openRouteStop"
      />

      <RouteStops
        v-if="routeStops.length"
        :route-stops="routeStops"
        :visited-stop-ids="visitedStopIds"
        :route-progress-percent="routeProgressPercent"
        :route-duration-name="routeDurationName"
        @start-route="startCurrentRoute"
        @open-stop="openRouteStop"
      />

      <SavedRoutes
        v-if="savedRoutes.length"
        :routes="savedRoutes"
        @open-route="openSavedRoute"
        @delete-route="deleteSavedRoute"
      />

      <RouteStopModal
        v-if="activeStop"
        :stop="activeStop"
        :visited="isStopVisited(activeStop.id)"
        :user="user"
        :user-profile="userProfile"
        :is-authenticated="isAuthenticated"
        @close="closeRouteStop"
        @play-audio="playStopAudio"
        @mark-visited="markStopVisited"
        @request-auth="handleCommunityAuth"
        @profile-changed="handleCommunityProfileChanged"
      />
    </template>

    <AuthModal
      v-if="showAuthModal"
      :yandex-loading="authLoading"
      :vk-loading="vkLoading"
      :error-message="authError || vkError"
      @close="showAuthModal = false"
      @yandex="signInWithYandex"
      @vk="signInWithVk"
      @guest="handleGuestEntry"
    />
  </div>
</template>


