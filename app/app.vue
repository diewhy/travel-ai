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
  readyMoscowRoutes,
  openReadyMoscowRoute,
  openRouteStop,
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

const {
  user,
  profile: authProfile,
  authReady,
  authError,
  isAuthenticated,
  signInWithCustomProvider
} = useAuth()

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
    role: 'Войдите через Яндекс',
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

  const name =
    dbProfile.display_name ||
    identityData.real_name ||
    identityData.display_name ||
    identityData.name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.value.email?.split('@')[0] ||
    'Путешественник'

  const level = Number(dbProfile.level || 1)

  userProfile.value = {
    ...userProfile.value,
    name,
    initials: getInitials(name),
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
  closeProfilePanel,
  openProfilePanel
})

const cityGroups = cities

function handleEnterPlatform() {
  if (!authReady.value) return

  if (isAuthenticated.value) {
    enterPlatform()
    return
  }

  showAuthModal.value = true
}

function handleSidebarProfile() {
  if (!isAuthenticated.value) {
    showAuthModal.value = true
    return
  }

  openSidebarProfile()
}

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
  ([ready, authenticated]) => {
    if (!ready || !authenticated) return

    syncAuthenticatedProfile()

    if (typeof window === 'undefined') return

    const intent = localStorage.getItem(
      'open-russia-auth-intent'
    )

    if (intent === 'enter') {
      localStorage.removeItem(
        'open-russia-auth-intent'
      )

      showAuthModal.value = false
      authLoading.value = false
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
  @enter="handleEnterPlatform"
  @preview="enterPlatformWithRoute"
/>
<AuthModal
  v-if="showAuthModal"
  :loading="authLoading"
  :error-message="authError"
  @close="showAuthModal = false"
  @yandex="signInWithYandex"
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
  @close="closeProfilePanel"
/>

<main class="new-home">
  <HomeOverview
    :route-mode="routeMode"
    :show-planner="showPlanner"
    :ready-routes="readyMoscowRoutes"
    @show-history="routeMode = 'history'; showPlanner = false"
    @show-planner="showPlanner = true"
    @show-art="routeMode = 'moscowArt'; showPlanner = true; place = ''"
    @open-route="openReadyMoscowRoute"
  />

  <RoutePlanner
  v-if="showPlanner"
  :route-mode="routeMode"
  :place="place"
  :route-duration="routeDuration"
  :days="days"
  :budget="budget"
  :city-groups="cityGroups"
  @close="closePlanner"
  @update:route-mode="routeMode = $event"
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
  :place="place"
  :route-duration-name="routeDurationName"
  :budget="budget"
  :active-route-image="activeRouteImage"
  :current-gallery="currentGallery"
  :active-image-index="activeImageIndex"
  :history="history"
  :memory-places="memoryPlaces"
  :pleinairs="pleinairs"
  :formatted-result="formattedResult"
  @select-image="setRouteImage"
  @download-pdf="downloadPdf"
/>

<YandexMap
  v-if="result && mapPoints.length"
  :key="routeTitle + '-' + mapPoints.length"
  :place="place"
  :points="mapPoints"
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
  @close="closeRouteStop"
  @play-audio="playStopAudio"
  @mark-visited="markStopVisited"
/>
</template>
  </div>
</template>


<style src="./assets/css/main.css"></style>

