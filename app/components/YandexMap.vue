<script setup>
import { ref, onMounted, watch } from 'vue'

const mapContainer = ref(null)

const props = defineProps({
  place: {
    type: String,
    default: 'Алтай'
  }
})

const config = useRuntimeConfig()
console.log('YANDEX KEY:', config.public.yandexMapsKey)

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

function loadYandexMaps() {
  return new Promise((resolve) => {
    if (window.ymaps) {
      resolve(window.ymaps)
      return
    }

    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${config.public.yandexMapsKey}&lang=ru_RU`
    script.onload = () => resolve(window.ymaps)
    document.head.appendChild(script)
  })
}

async function initMap() {
  const ymaps = await loadYandexMaps()

  ymaps.ready(() => {
    const center = centers[props.place] || centers['Алтай']

    map = new ymaps.Map('yandex-map', {
      center,
      zoom: 7,
      controls: ['zoomControl', 'fullscreenControl']
    })

    placemark = new ymaps.Placemark(center, {
      balloonContent: props.place
    })

    map.geoObjects.add(placemark)
  })
}

function updateMap() {
  if (!map || !placemark) return

  const center = centers[props.place] || centers['Алтай']

  map.setCenter(center, 7, {
    duration: 600
  })

  placemark.geometry.setCoordinates(center)
  placemark.properties.set('balloonContent', props.place)
}

onMounted(() => {
  initMap()
})

watch(
  () => props.place,
  () => {
    updateMap()
  }
)
</script>

<template>
  <div class="map-card">
    <h2>Карта путешествия</h2>
    <div ref="mapContainer" class="yandex-map"></div>
  </div>
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
}

.map-card h2 {
  margin: 0 0 18px;
}

.yandex-map {
  width: 100%;
  height: 420px;
  border-radius: 22px;
  overflow: hidden;
}
</style>