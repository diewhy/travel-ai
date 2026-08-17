import {
  ref,
  nextTick
} from 'vue'

export function useNavigation({
  showPlanner,
  routeMode,
  place,
  result,
  mapPoints,
  openReadyMoscowRoute,
  closeProfilePanel,
  openProfilePanel
}) {
  const showWelcomeScreen = ref(true)

  async function scrollToBlock(selector) {
    await nextTick()

    if (typeof document === 'undefined') return

    document
      .querySelector(selector)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
  }

  function scrollToTop() {
    if (typeof window === 'undefined') return

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  async function enterPlatform() {
    showWelcomeScreen.value = false

    await nextTick()
    scrollToTop()
  }

  async function enterPlatformWithRoute() {
    showWelcomeScreen.value = false

    await nextTick()
    await openReadyMoscowRoute('short')
  }

  async function sidebarHome() {
    showPlanner.value = false
    closeProfilePanel?.()

    await nextTick()
    scrollToTop()
  }

  async function sidebarRoutes() {
    routeMode.value = 'history'
    showPlanner.value = false
    closeProfilePanel?.()

    await scrollToBlock('.new-ready-section')
  }

  async function sidebarCreateRoute() {
    showPlanner.value = true
    closeProfilePanel?.()

    await scrollToBlock('.new-planner-card')
  }

  async function sidebarMap() {
    closeProfilePanel?.()

    if (!result.value || !mapPoints.value.length) {
      await openReadyMoscowRoute('short')
    }

    await scrollToBlock('.map-card')
  }

  async function sidebarArt() {
    routeMode.value = 'moscowArt'
    showPlanner.value = true
    place.value = ''
    closeProfilePanel?.()

    await scrollToBlock('.new-planner-card')
  }

  function sidebarProfile() {
    openProfilePanel?.()
  }

  return {
    showWelcomeScreen,
    enterPlatform,
    enterPlatformWithRoute,
    scrollToBlock,
    sidebarHome,
    sidebarRoutes,
    sidebarCreateRoute,
    sidebarMap,
    sidebarArt,
    sidebarProfile
  }
}
