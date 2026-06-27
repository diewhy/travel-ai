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
  'Алтай': [51.9581, 85.9603],
  'Байкал': [53.5587, 108.1650],
  'Карелия': [61.7891, 34.3597],
  'Камчатка': [53.0370, 158.6559],
  'Дагестан': [42.9849, 47.5047],
  'Сочи': [43.5855, 39.7231],

  'Ржев': [56.2624, 34.3291],
  'Волоколамск': [56.0358, 35.9586],
  'Белгород': [50.5977, 36.5858],
  'Курск': [51.7304, 36.1926],
  'Кронштадт': [59.9917, 29.7778],
  'Елец': [52.6151, 38.5282]
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
    const center = centers[props.place] || centers['Алтай']

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

function drawPoints() {
  if (!map || !window.ymaps) return

  map.geoObjects.removeAll()

  const fallbackCenter = centers[props.place] || centers['Алтай']

  const points = props.points?.length
    ? props.points
    : [props.place]
    console.log('MAP PLACE:', props.place)
    console.log('MAP POINTS:', props.points)
    console.log('POINTS USED:', points)

  const coordsList = []

  const geocodePromises = points.map((point) => {
     console.log('COORDS LIST:', coordsList)

  coordsList.forEach((item) => {
    const placemark = new window.ymaps.Placemark(
      item.coords,
      {
        balloonContent: item.name,
        hintContent: item.name
      },
      {
        preset: 'islands#blueDotIcon'
      }
    )

    map.geoObjects.add(placemark)
  })

  if (coordsList.length > 1) {
    const routePoints = coordsList.map(item => item.coords)

    window.ymaps.route(routePoints, {
      mapStateAutoApply: false
    }).then((route) => {
      map.geoObjects.add(route)

      const bounds = route.getBounds()
      if (bounds) {
        map.setBounds(bounds, {
          checkZoomRange: true,
          zoomMargin: 60
        })
      }
    }).catch(() => {
      const line = new window.ymaps.Polyline(
        routePoints,
        {},
        {
          strokeColor: '#00bfff',
          strokeWidth: 5,
          strokeOpacity: 0.9
        }
      )

      map.geoObjects.add(line)
    })
  }

  const bounds = map.geoObjects.getBounds()

  if (bounds) {
    map.setBounds(bounds, {
      checkZoomRange: true,
      zoomMargin: 60
    })
  } else {
    map.setCenter(fallbackCenter, 8)
  }
})
    const pointName = String(point).trim()

    if (centers[pointName]) {
      coordsList.push({
        name: pointName,
        coords: centers[pointName]
      })

      return Promise.resolve()
    }

    return window.ymaps.geocode(`${props.place}, ${pointName}`).then((res) => {
      const firstGeoObject = res.geoObjects.get(0)

      if (!firstGeoObject) {
        coordsList.push({
          name: pointName,
          coords: fallbackCenter
        })
        return
      }

      coordsList.push({
        name: pointName,
        coords: firstGeoObject.geometry.getCoordinates()
      })
    }).catch(() => {
      coordsList.push({
        name: pointName,
        coords: fallbackCenter
      })
    })
  })

  if (coordsList.length > 1) {

    const routePoints = coordsList.map(item => item.coords)

    window.ymaps.route(routePoints, {
        mapStateAutoApply: false
    }).then((route) => {

        route.getPaths().options.set({
            strokeColor: '#00bfff',
            strokeWidth: 5,
            strokeOpacity: 0.9
        })

        map.geoObjects.add(route)

        const bounds = route.getBounds()

        if (bounds) {
            map.setBounds(bounds, {
                checkZoomRange: true,
                zoomMargin: 60
            })
        }

    }).catch(() => {

        const line = new window.ymaps.Polyline(
            routePoints,
            {},
            {
                strokeColor: '#00bfff',
                strokeWidth: 5,
                strokeOpacity: 0.9
            }
        )

        map.geoObjects.add(line)

    })
}

    const bounds = map.geoObjects.getBounds()

    if (bounds) {
      map.setBounds(bounds, {
        checkZoomRange: true,
        zoomMargin: 60
      })
    } else {
      map.setCenter(fallbackCenter, 8)
    }

    setTimeout(() => {
      map.container.fitToViewport()
    }, 300)
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