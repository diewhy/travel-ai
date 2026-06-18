<script setup>
import { onMounted, watch } from 'vue'

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
  'Алтай': [51.9581, 85.9603],
  'Байкал': [53.5587, 108.1650],
  'Карелия': [61.7891, 34.3597],
  'Камчатка': [53.0370, 158.6559],
  'Дагестан': [42.9849, 47.5047],
  'Сочи': [43.5855, 39.7231]
}

let map = null
let placemark = null

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
  const ymaps = await loadScript()

  ymaps.ready(() => {
    const center = centers[props.place] || centers['Алтай']

    map = new ymaps.Map('yandex-map', {
      center,
      zoom: 7,
      controls: ['zoomControl', 'fullscreenControl']
    })

    setTimeout(() => {
      map.container.fitToViewport()
    }, 500)

    drawPoints()

    map.geoObjects.add(placemark)
  })
}

function drawPoints() {
  if (!map || !window.ymaps) return

  map.geoObjects.removeAll()

  const points = props.points?.length
    ? props.points
    : [props.place]

  points.forEach((point) => {
    window.ymaps.geocode(point).then((res) => {
      const firstGeoObject = res.geoObjects.get(0)

      if (!firstGeoObject) return

      const coords = firstGeoObject.geometry.getCoordinates()

      const placemark = new window.ymaps.Placemark(coords, {
        balloonContent: point
      })

      map.geoObjects.add(placemark)
    })
  })
}

function updateMap() {
  if (!map || !placemark) return

  drawPoints()

  const center = centers[props.place] || centers['Алтай']

  map.setCenter(center, 7, { duration: 600 })
  placemark.geometry.setCoordinates(center)
  placemark.properties.set('balloonContent', props.place)
}

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 300)
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
  <section
  class="map-card"
  style="max-width:1180px;margin:40px auto;padding:24px;min-height:520px;"
    >
    <h2>Карта путешествия</h2>
    <div
  id="yandex-map"
  style="width:100%;height:420px;min-height:420px;display:block;border-radius:22px;overflow:hidden;background:rgba(255,255,255,.18);"
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
  width: 100% !important;
  height: 420px !important;
  min-height: 420px !important;
  display: block !important;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255,255,255,.18);
}
</style>