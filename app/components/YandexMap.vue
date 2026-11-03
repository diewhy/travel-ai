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

const emit = defineEmits(['select-point'])

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

async function drawPoints() {
  if (!map || !window.ymaps) return

  map.geoObjects.removeAll()

  const sourcePoints =
    Array.isArray(props.points) && props.points.length
      ? props.points
      : []

  const resolvedPoints = await Promise.all(
    sourcePoints.map(async (point) => {
      // Точка уже содержит координаты
      if (
        point &&
        typeof point === 'object' &&
        Array.isArray(point.coords) &&
        point.coords.length === 2
      ) {
        return {
          ...point,
          name: point.name || 'Точка маршрута',
          coords: [...point.coords]
        }
      }

      // Точка пришла в виде названия
      const rawName =
        typeof point === 'string'
          ? point.trim()
          : String(point?.name || '').trim()

      if (!rawName) return null

      const placeName = String(props.place || '').trim()

      const searchName =
        placeName &&
        !rawName.toLowerCase().includes(placeName.toLowerCase())
          ? `${rawName}, ${placeName}`
          : rawName

      try {
        const response = await window.ymaps.geocode(searchName)
        const geoObject = response.geoObjects.get(0)

        if (!geoObject) return null

        return {
          name: rawName,
          coords: geoObject.geometry.getCoordinates()
        }
      } catch (error) {
        console.warn('Не удалось найти точку:', searchName, error)
        return null
      }
    })
  )

  const validPoints = resolvedPoints.filter(Boolean)

  if (!validPoints.length) return

  // Пронумерованные точки
  validPoints.forEach((point, index) => {
    const placemark = new window.ymaps.Placemark(
      point.coords,
      {
        iconContent: String(index + 1),
        hintContent: `${index + 1}. ${point.name}`,
        balloonContent: `<strong>${index + 1}. ${point.name}</strong>`
      },
      {
        preset: 'islands#greenCircleIcon',
        zIndex: 1000
      }
    )
      placemark.events.add('click', () => {
        emit('select-point', point)
      })
      
    map.geoObjects.add(placemark)
  })

  // Прямая линия между точками
  if (validPoints.length > 1) {
    const routeLine = new window.ymaps.Polyline(
      validPoints.map((point) => point.coords),
      {},
      {
        strokeColor: '#078b7c',
        strokeWidth: 6,
        strokeOpacity: 0.9
      }
    )

    map.geoObjects.add(routeLine)
  }

  const bounds = map.geoObjects.getBounds()

  if (bounds) {
    map.setBounds(bounds, {
      checkZoomRange: true,
      zoomMargin: 70
    })
  }
}


watch(
  [
    () => props.points,
    () => props.place
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
  <section
    class="rp2-map"
    aria-label="Карта путешествия"
    style="display:block;box-sizing:border-box;width:100%;max-width:1220px;min-height:0;margin:0 auto 22px;padding:22px;border:1px solid #e0e9ed;border-radius:20px;background:#ffffff;color:#193347;"
  >
    <div class="rp2-map__header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:16px;">
      <div class="rp2-map__heading">
        <p class="rp2-map__eyebrow" style="margin:0 0 5px;color:#078b7c;font-size:11px;font-weight:800;letter-spacing:.08em;">ИССЛЕДУЙТЕ МАРШРУТ</p>
        <h2 style="margin:0 0 6px;color:#193347;font-size:clamp(21px,2.5vw,29px);line-height:1.2;">Карта путешествия</h2>
        <p style="margin:0;color:#667c8b;font-size:12px;">Выберите метку на карте, чтобы открыть достопримечательность.</p>
      </div>
      <div class="rp2-map__badges" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;">
        <span class="rp2-map__badge" style="display:inline-flex;align-items:center;min-height:33px;padding:6px 11px;border:1px solid #dcece8;border-radius:999px;background:#f0f8f6;color:#176b60;font-size:12px;font-weight:700;white-space:nowrap;">
          Точек: {{ points.length }}
        </span>
        <span class="rp2-map__badge" style="display:inline-flex;align-items:center;min-height:33px;padding:6px 11px;border:1px solid #dcece8;border-radius:999px;background:#f0f8f6;color:#176b60;font-size:12px;font-weight:700;white-space:nowrap;">
          {{ travelMode === 'auto' ? 'Автомобильный' : 'Пеший' }}
        </span>
      </div>
    </div>

    <div class="rp2-map__frame" style="box-sizing:border-box;width:100%;min-width:0;overflow:hidden;border:1px solid #dce7e9;border-radius:15px;background:#edf4f3;">
      <div
        ref="mapEl"
        class="rp2-map__canvas"
        style="display:block;position:relative;box-sizing:border-box;width:100%;height:440px;min-height:440px;overflow:hidden;background:#edf4f3;"
      ></div>
    </div>

    <div class="rp2-map__footer" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:12px;color:#738694;font-size:11px;line-height:1.5;">
      <span>Номера меток соответствуют порядку остановок.</span>
      <span>Линия соединяет точки напрямую, не по дорогам.</span>
    </div>
  </section>
</template>

<style scoped>
.rp2-map { box-shadow: 0 12px 35px rgba(20,52,67,.05); }
.rp2-map__heading { min-width: 0; flex: 1 1 280px; }
.rp2-map__heading h2 { letter-spacing: -.03em; font-weight: 800; }
.rp2-map__canvas { isolation: isolate; }
@media (max-width: 650px) {
  .rp2-map { padding: 14px !important; border-radius: 16px !important; }
  .rp2-map__canvas { height: 340px !important; min-height: 340px !important; }
  .rp2-map__header { align-items: flex-start !important; }
}
</style>
