import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { readyMoscowRoutes } from '../../data/readyMoscowRoutes.js'
import { moscowStopContent } from '../../data/moscowStopContent.js'
import {
  destinationImages,
  destinationGalleries
} from '../../data/destinationMedia.js'

export function useRoutes(options = {}) {
  const place = ref('')
  const days = ref('')
  const routeDuration = ref('short')
  const budget = ref('')
  const travelType = ref('Активный')
  const savedRoutes = ref([])
  const result = ref('')
  const mapPoints = ref([])
  const routeStops = ref([])
  const activeStop = ref(null)
  const currentReadyRouteId = ref('')
  const history = ref('')
  const memoryPlaces = ref([])
  const routeTitle = ref('')
  const routeAbout = ref('')
  const pleinairs = ref([])
  const equipment = ref([])
  const routeSummary = ref('')
  const mapTravelMode = ref('pedestrian')
  const showPlanner = ref(false)
  const routeMode = ref('history')
  const activeImageIndex = ref(0)

  let galleryTimer = null

  const formattedResult = computed(() => {
    const text = typeof result.value === 'string'
      ? result.value
      : JSON.stringify(result.value, null, 2)

    return text
      .replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>')
      .replace(/\n/g, '<br>')
  })

  const routeDurationName = computed(() => {
    if (routeDuration.value === 'short') return 'Короткий'
    if (routeDuration.value === 'day') return 'На день'
    if (routeDuration.value === 'long') return 'Несколько дней'
    return '—'
  })

  const currentDestinationImage = computed(() => {
    return destinationImages[place.value] || '/fon.png'
  })

  const currentGallery = computed(() => {
    return (
      destinationGalleries[place.value] ||
      [currentDestinationImage.value]
    )
  })

  const activeRouteImage = computed(() => {
    return currentGallery.value[activeImageIndex.value]
  })

  function startGalleryAutoplay() {
    stopGalleryAutoplay()

    galleryTimer = setInterval(() => {
      if (currentGallery.value.length > 1) {
        activeImageIndex.value =
          (activeImageIndex.value + 1) %
          currentGallery.value.length
      }
    }, 4000)
  }

  function stopGalleryAutoplay() {
    if (!galleryTimer) return

    clearInterval(galleryTimer)
    galleryTimer = null
  }

  function setRouteImage(index) {
    activeImageIndex.value = index
    startGalleryAutoplay()
  }

  function closePlanner() {
    showPlanner.value = false
    result.value = ''
    days.value = ''
    budget.value = ''
  }

  function selectDestination(name) {
    place.value = name
    showPlanner.value = true
    result.value = ''
    activeImageIndex.value = 0
  }

  async function openReadyMoscowRoute(routeId) {
    const route = readyMoscowRoutes.find(
      (item) => item.id === routeId
    )

    if (!route) {
      console.warn('Маршрут не найден:', routeId)
      return
    }

    showPlanner.value = false
    routeMode.value = 'history'
    routeDuration.value = route.durationValue
    place.value = 'Москва'
    days.value = route.days
    budget.value = ''
    activeImageIndex.value = 0

    currentReadyRouteId.value = route.id
    activeStop.value = null

    routeTitle.value = route.title
    history.value = route.history
    memoryPlaces.value = [...route.memoryPlaces]

    pleinairs.value = []
    equipment.value = []
    routeSummary.value = ''

    routeStops.value = route.mapPoints.map((point, index) => {
      const content =
        moscowStopContent[point.name] || {
          description:
            'Памятное место, включённое в военно-исторический маршрут по Москве.',
          task:
            'Осмотрите объект и отметьте деталь, которая показалась наиболее значимой.'
        }

      return {
        ...point,
        id: `${route.id}-${index}`,
        number: index + 1,
        description: content.description,
        task: content.task,
        audio:
          content.audio ||
          `${point.name}. ${content.description} Это одна из точек военно-исторического маршрута по Москве. Осмотрите объект внимательно, обратите внимание на детали памятника, мемориала или музейного пространства. После осмотра выполните задание: ${content.task}`
      }
    })

    mapPoints.value = routeStops.value.map((stop) => ({
      ...stop,
      coords: [...stop.coords]
    }))

    options.loadRouteProgress?.(route.id)

    result.value = route.text

    await nextTick()

    document.querySelector('.result-wrap')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  async function generateRoute() {
    result.value =
      'Генерируем маршрут, подождите 10-20 секунд...'

    history.value = ''
    memoryPlaces.value = []
    mapPoints.value = []
    routeStops.value = []

    routeTitle.value = ''
    routeAbout.value = ''
    pleinairs.value = []
    equipment.value = []
    routeSummary.value = ''

    if (Number(days.value) > 7) {
      result.value =
        'Пока доступна генерация маршрутов до 7 дней'
      return
    }

    try {
      const response = await $fetch('/api/generate', {
        method: 'POST',
        body: {
          place: place.value,
          days: days.value,
          budget: budget.value,
          travelType: travelType.value,
          mode: routeMode.value,
          routeDuration: routeDuration.value
        }
      })

      result.value =
        typeof response.route === 'string'
          ? response.route
          : JSON.stringify(response.route, null, 2)

      history.value = response.history || ''
      memoryPlaces.value = response.memoryPlaces || []
      mapPoints.value = response.mapPoints || []
      routeTitle.value = response.title || ''
      routeAbout.value = response.about || ''
      pleinairs.value = response.pleinairs || []
      equipment.value = response.equipment || []
      routeSummary.value = response.summary || ''

      saveCurrentRoute()

      await nextTick()

      document
        .querySelector('.result-wrap')
        ?.scrollIntoView({
          behavior: 'smooth'
        })
    } catch (error) {
      result.value =
        'Ошибка:' +
        (
          error?.data?.message ||
          error?.message ||
          'неизвестная ошибка'
        )
    }
  }

  function loadSavedRoutes() {
    try {
      const saved = localStorage.getItem('saved-routes')

      savedRoutes.value = saved
        ? JSON.parse(saved)
        : []
    } catch {
      savedRoutes.value = []
    }
  }

  function saveCurrentRoute() {
    if (!result.value) return

    const newRoute = {
      place: place.value,
      days: days.value,
      budget: budget.value,
      travelType: travelType.value,
      routeText: result.value,
      mapPoints: mapPoints.value,
      date: new Date().toLocaleDateString()
    }

    savedRoutes.value.unshift(newRoute)

    localStorage.setItem(
      'saved-routes',
      JSON.stringify(savedRoutes.value)
    )
  }

  function openSavedRoute(route) {
    place.value = route.place
    days.value = route.days
    budget.value = route.budget
    travelType.value = route.travelType

    result.value = route.routeText
    showPlanner.value = true
    activeImageIndex.value = 0
    mapPoints.value = route.mapPoints || []

    nextTick(() => {
      document
        .querySelector('.result-wrap')
        ?.scrollIntoView({
          behavior: 'smooth'
        })
    })
  }

  function deleteSavedRoute(index) {
    savedRoutes.value.splice(index, 1)

    localStorage.setItem(
      'saved-routes',
      JSON.stringify(savedRoutes.value)
    )
  }

  function downloadPdf() {
    const printWindow = window.open('', '_blank')

    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>${place.value}-маршрут</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111827;
              line-height: 1.6;
            }

            h1 {
              color: #0b2f5b;
              font-size: 32px;
            }

            h2 {
              color: #0284c7;
              font-size: 24px;
            }

            h3 {
              color: #2563eb;
              margin-top: 28px;
            }

            .meta {
              font-weight: 700;
              margin-bottom: 30px;
            }
          </style>
        </head>

        <body>
          <h1>Открой Россию</h1>

          <h2>
            Маршрут по направлению: ${place.value}
          </h2>

          <div class="meta">
            ${routeDurationName.value} ·
            ${budget.value} ₽ ·
            ${travelType.value}
          </div>

          <div>
            ${formattedResult.value}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
    }
  }

  onMounted(() => {
    startGalleryAutoplay()
    loadSavedRoutes()
  })

  onBeforeUnmount(() => {
    stopGalleryAutoplay()
  })

  return {
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
    openRouteStop: (stop) => {
      activeStop.value = stop
    },
    closePlanner,
    generateRoute,
    setRouteImage,
    selectDestination,
    openSavedRoute,
    deleteSavedRoute,
    downloadPdf
  }
}
