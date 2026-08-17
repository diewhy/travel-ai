import {
  ref,
  shallowRef,
  computed
} from 'vue'

export function useRouteProgress() {
  const visitedStopIds = ref([])
  const boundRouteStops = shallowRef(null)
  const boundCurrentRouteId = shallowRef(null)

  const routeProgressPercent = computed(() => {
    const stops = boundRouteStops.value?.value || []

    if (!stops.length) return 0

    return Math.round(
      (visitedStopIds.value.length / stops.length) * 100
    )
  })

  const nextRouteStop = computed(() => {
    const stops = boundRouteStops.value?.value || []

    return (
      stops.find(
        (stop) => !visitedStopIds.value.includes(stop.id)
      ) ||
      stops[0] ||
      null
    )
  })

  function bindRouteProgress({
    routeStops,
    currentReadyRouteId
  }) {
    boundRouteStops.value = routeStops
    boundCurrentRouteId.value = currentReadyRouteId
  }

  function isStopVisited(stopId) {
    return visitedStopIds.value.includes(stopId)
  }

  function loadRouteProgress(routeId) {
    if (typeof window === 'undefined') {
      visitedStopIds.value = []
      return
    }

    try {
      const saved = localStorage.getItem(
        `route-progress-${routeId}`
      )

      visitedStopIds.value = saved
        ? JSON.parse(saved)
        : []
    } catch {
      visitedStopIds.value = []
    }
  }

  function markStopVisited(stop) {
    if (!stop?.id) return

    if (!visitedStopIds.value.includes(stop.id)) {
      visitedStopIds.value.push(stop.id)
    }

    if (typeof window === 'undefined') return

    const routeId =
      boundCurrentRouteId.value?.value || ''

    if (!routeId) return

    localStorage.setItem(
      `route-progress-${routeId}`,
      JSON.stringify(visitedStopIds.value)
    )
  }

  return {
    visitedStopIds,
    routeProgressPercent,
    nextRouteStop,
    loadRouteProgress,
    bindRouteProgress,
    isStopVisited,
    markStopVisited
  }
}
