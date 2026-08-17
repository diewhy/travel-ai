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
import { useRoutes } from './composables/useRoutes.js'
import { useAudioGuide } from './composables/useAudioGuide.js'
import { useRouteProgress } from './composables/useRouteProgress.js'
import { useUserProfile } from './composables/useUserProfile.js'
import { useNavigation } from './composables/useNavigation.js'
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

const {
  showWelcomeScreen,
  enterPlatform,
  enterPlatformWithRoute,
  sidebarHome,
  sidebarRoutes,
  sidebarCreateRoute,
  sidebarMap,
  sidebarArt,
  sidebarProfile
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
  @enter="enterPlatform"
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
  @profile="sidebarProfile"
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

