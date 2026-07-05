<script setup>
import { onMounted, watch, ref } from 'vue'

const props = defineProps({
  place: {
    type: String,
    default: 'Алтай'
  },
  points: {
    type: Array,
    default: () => []
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

  const coordsList = []

  const points = props.points?.length
    ? props.points
    : [props.place]

  const geocodePromises = points.map((point) => {
    if (
  typeof point === 'object' &&
  point !== null &&
  Array.isArray(point.coords)
) {
  const pointName = point.name || 'Точка маршрута'
  const coords = point.coords

  coordsList.push({
    name: pointName,
    coords
  })

  const placemark = new window.ymaps.Placemark(
    coords,
    {
      balloonContent: pointName,
      hintContent: pointName
    }
  )

  map.geoObjects.add(placemark)

  return Promise.resolve(coords)
}

    const rawName = 
      typeof point === 'string'
      ? point.trim()
      : String(point?.name || '').trim()

    const key = rawName.toLowerCase()

const matchedKey = Object.keys(knownCoords).find((name) =>
  key.includes(name) || name.includes(key)
)

if (matchedKey) {
  const coords = knownCoords[matchedKey]

  coordsList.push({
    name: rawName,
    coords
  })

  const placemark = new window.ymaps.Placemark(coords, {
    balloonContent: rawName,
    hintContent: rawName
  })

  map.geoObjects.add(placemark)

  return Promise.resolve(coords)
}

    const pointName = rawName.toLowerCase().includes('москва') ||
      rawName.toLowerCase().includes(String(props.place).toLowerCase())
      ? rawName
      : `${rawName}, ${props.place}`
    return window.ymaps.geocode(pointName)
  .then((res) => {
    const firstGeoObject = res.geoObjects.get(0)

    if (!firstGeoObject) {
      console.warn('Не найдено:', pointName)
      return
    }

    const coords = firstGeoObject.geometry.getCoordinates()
    console.log('POINT:', pointName, coords)

    coordsList.push({
      name: pointName,
      coords
    })

    const placemark = new window.ymaps.Placemark(coords, {
      balloonContent: pointName,
      hintContent: pointName
    })

    map.geoObjects.add(placemark)
  })
  .catch((error) => {
    console.warn('Ошибка геокодинга:', pointName, error)
  })
  })

  Promise.all(geocodePromises).then(() => {
    if (coordsList.length > 1) {
      const line = new window.ymaps.Polyline(
        coordsList.map((item) => item.coords),
        {},
        {
          strokeColor: '#00bfff',
          strokeWidth: 5,
          strokeOpacity: 0.9
        }
      )

      map.geoObjects.add(line)
    }

    const bounds = map.geoObjects.getBounds()

    if (bounds) {
      map.setBounds(bounds, {
        checkZoomRange: true,
        zoomMargin: 60
      })
    }
  })
}
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