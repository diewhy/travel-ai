<script setup>
import { onMounted, watch, ref, onBeforeMount} from 'vue'

const props = defineProps({
  place: {
    type: String,
    default: 'Алтай'
  },
  points: {
    type: Array,
    default: () => []
  },
  travelMode: {
    type: String,
    default: 'pedestrian'
  }
})

const config = useRuntimeConfig()

const centers = {
  'Москва': [55.7558, 37.6173],
  'Дмитров': [56.3439, 37.5200],
  'Наро-Фоминск': [55.3862, 36.7345],
  'Кубинка': [55.5756, 36.6950],
  'Красногорск': [55.8311, 37.3302],
  'Зеленоград': [55.9872, 37.2022],
  'Можайск': [55.5069, 36.0241],
  'Истра': [55.9142, 36.8602],
  'Дубосеково': [55.9816, 36.0154]
}

let map = null

const mapEl = ref(null)

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.ymaps) {
      resolve(window.ymaps)
      return
    }

    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${config.public.yandexMapsKey}&lang=ru_RU`
    script.onload = () => resolve(window.ymaps)
    script.onerror = reject

    document.head.appendChild(script)
  })
}

async function initMap() {
  if (map) return

  const container = mapEl.value
  if (!container) return

  const ymaps = await loadScript()

  ymaps.ready(() => {
    const center = centers[props.place] || centers['Москва']

    map = new ymaps.Map(container, {
      center,
      zoom: 8,
      controls: ['zoomControl', 'fullscreenControl']
    })

    setTimeout(() => {
      map.container.fitToViewport()
      drawPoints()
    }, 500)
  })
}

const knownCoords = {
  'музей победы на поклонной горе': [55.7309, 37.5066],
  'парк победы': [55.7353, 37.5186],
  'александровский сад': [55.7521, 37.6137],
  'могила неизвестного солдата': [55.7540, 37.6131],
  'вечный огонь': [55.7540, 37.6131],
  'красная площадь': [55.7539, 37.6208],
  'манежная площадь': [55.7552, 37.6156],
  'государственный исторический музей': [55.7554, 37.6178],
  'музей победы': [55.7309, 37.5066],
  'музей победы на поклонной горе': [55.7309, 37.5066],
  'поклонная гора': [55.7309, 37.5066],
  'парк победы': [55.7353, 37.5186],

  'александровский сад': [55.7521, 37.6137],
  'могила неизвестного солдата': [55.7540, 37.6131],
  'вечный огонь': [55.7540, 37.6131],

  'красная площадь': [55.7539, 37.6208],
  'манежная площадь': [55.7552, 37.6156],
  'государственный исторический музей': [55.7554, 37.6178],

  'музей техники вадима задорожного': [55.7991, 37.3037],
  'центральный музей великой отечественной войны': [55.7309, 37.5066],
  'музей-панорама бородинская битва': [55.7387, 37.5236]
}

function drawPoints() {
  if (!map || !window.ymaps) return

  map.geoObjects.removeAll()

  const sourcePoints =
    Array.isArray(props.points) && props.points.length
      ? props.points
      : [props.place]

  const referencePoints = sourcePoints
    .map((point) => {
      // Готовая точка с координатами
      if (
        point &&
        typeof point === 'object' &&
        Array.isArray(point.coords) &&
        point.coords.length === 2
      ) {
        return point.coords
      }

      // Точка в виде названия
      const rawName =
        typeof point === 'string'
          ? point.trim()
          : String(point?.name || '').trim()

      if (!rawName) return null

      const placeName = String(props.place || '').trim()

      if (
        placeName &&
        !rawName
          .toLowerCase()
          .includes(placeName.toLowerCase())
      ) {
        return `${rawName}, ${placeName}`
      }

      return rawName
    })
    .filter(Boolean)

  if (!referencePoints.length) return

  // Если точка одна — показываем обычный маркер
  if (referencePoints.length === 1) {
    const placemark = new window.ymaps.Placemark(
      referencePoints[0]
    )

    map.geoObjects.add(placemark)

    map.setCenter(referencePoints[0], 15)

    return
  }

  // Настоящий маршрут по дорогам или тротуарам
  const multiRoute =
    new window.ymaps.multiRouter.MultiRoute(
      {
        referencePoints,

        params: {
          routingMode:
            props.travelMode === 'auto'
              ? 'auto'
              : 'pedestrian'
        }
      },
      {
        boundsAutoApply: true
      }
    )

  map.geoObjects.add(multiRoute)
}

watch(
  [
    () => props.points,
    () => props.travelMode
  ],
  () => {
    if (map) {
      drawPoints()
    }
  },
  {
    deep: true
  }
)

function updateMap() {
  if (!map) return

  const center = centers[props.place] || centers['Алтай']
  
  map.setCenter(center, 8, { duration: 600 })
  drawPoints()

}

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 500)
})

watch(
  () => [props.place, props.points],
  () => {
    updateMap()
  },
  { deep: true }
)
</script>

<template>
  <section class="map-card">
    <h2>Карта путешествия</h2>

    <div 
      ref="mapEl"
      class="yandex-map"
      style="width: 100%; height: 420px; min-height: 420px; display: block; border-radius: 22px; overflow: hidden; background: rgba(255,255,255,.25); border: 2px solid rgba(255,255,255,.35);"
    >
  </div>
  </section>
</template>

<style scoped>
.map-card {
  max-width: 1180px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(16px);
  color: white;
  display: block;
  min-height: 520px;
}

.map-card h2 {
  margin: 0 0 18px;
}

.yandex-map {
  width: 100%;
  height: 420px;
  min-height: 420px;
  display: block;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255,255,255,.18);
}
</style>