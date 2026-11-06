<script setup>
import { computed, ref, nextTick, onBeforeUnmount, watch } from 'vue'
import AccessibilityPassport from './AccessibilityPassport.vue'
import AccessibilityAuditWorkspace from './AccessibilityAuditWorkspace.vue'

defineEmits(['back'])

// Критерии пользователя — не подтверждения доступности объектов.
const accessOptions = [
  { id: 'stepFree', label: 'Без ступеней', detail: 'Входы и переходы без лестниц' },
  { id: 'wheelchair', label: 'Для кресла-коляски', detail: 'Ширина проходов, уклоны, покрытие' },
  { id: 'rest', label: 'Места для отдыха', detail: 'Скамейки и возможность сделать паузу' },
  { id: 'toilet', label: 'Доступный туалет', detail: 'Подтверждённая доступность санузла' },
  { id: 'parking', label: 'Парковка', detail: 'Специальные парковочные места' },
  { id: 'companion', label: 'Помощь на маршруте', detail: 'Условия сопровождения' },
  { id: 'quiet', label: 'Спокойный темп', detail: 'Небольшие участки и частые остановки' },
  { id: 'family', label: 'Семейная прогулка', detail: 'Условия для разных возрастов' }
]

const selectedNeeds = ref([])
const selectedTheme = ref('all')
const expandedPassportId = ref(null)
const expandedAuditId = ref(null)
const isDevelopment = import.meta.dev
const themes = [
  { id: 'all', label: 'Все направления' },
  { id: 'history', label: 'История и память' },
  { id: 'family', label: 'Для всей семьи' },
  { id: 'culture', label: 'Культура и город' }
]

// Кандидаты, не опубликованные в качестве доступных маршрутов.
// После реального обследования сюда можно добавить статусы и факты.
const pilotCandidates = [
  {
    id: 'vdnh',
    number: '01',
    title: 'ВДНХ: прогулка по центральной территории',
    description: 'Первые точки официального маршрута «Центральный». Условия этого короткого участка ещё не проверены Russplore.',
    // Четыре ориентира из официального маршрута ВДНХ, а не подтверждение их доступности Russplore.
    stops: ['Арка Главного входа', 'Музей ВДНХ', 'Инклюзивная детская площадка', 'Северный розарий'],
    sourceUrl: 'https://vdnh.ru/routes/9/',
    sourceLabel: 'Маршрут на сайте ВДНХ',
    tags: ['family', 'culture'],
    label: 'Городская прогулка',
    check: ['Покрытие и уклоны', 'Входы и переходы', 'Места отдыха и туалеты'],
    // Это план будущего обследования, НЕ подтверждённые свойства маршрута.
    auditFocus: ['stepFree', 'wheelchair', 'rest', 'toilet', 'quiet', 'family']
  },
  {
    id: 'victory-park',
    number: '02',
    title: 'Парк Победы: история и память',
    description: 'Пять памятных мест на Поклонной горе. Условия доступности всего пути предстоит проверить.',
    // Порядок посещения — пилотный план Russplore; не подтверждённый безбарьерный путь.
    stops: [
      'Главная аллея Парка Победы',
      'Фонтанный комплекс «Годы войны»',
      'Монумент Победы',
      'Вечный огонь',
      'Музей Победы'
    ],
    sourceUrl: 'https://victorymuseum.ru/for-visitors/map/',
    sourceLabel: 'Схема проезда Музея Победы',
    tags: ['history', 'family'],
    label: 'История и память',
    check: ['Непрерывность пути', 'Переходы и уклоны', 'Доступность входов'],
    auditFocus: ['stepFree', 'wheelchair', 'rest', 'parking', 'companion', 'family']
  },
  {
    id: 'moscow-center',
    number: '03',
    title: 'Исторический центр Москвы',
    description: 'Пять исторических ориентиров в центре города. Проходимость переходов и доступность пути ещё предстоит проверить.',
    // Порядок остановок — предварительный план прогулки Russplore, не проверенный безбарьерный маршрут.
    stops: [
      'Манежная площадь',
      'Александровский сад',
      'Могила Неизвестного Солдата',
      'Красная площадь',
      'Покровский собор (храм Василия Блаженного)'
    ],
    tags: ['history', 'culture'],
    label: 'История города',
    check: ['Бордюры и переходы', 'Покрытие улиц', 'Доступные точки отдыха'],
    auditFocus: ['stepFree', 'rest', 'toilet', 'quiet', 'companion']
  }
]

// Справочные сведения из официальных источников; не заменяют обследование пути.
const officialNotes = {
  "vdnh": {
    "heading": "Сведения ВДНХ и АТОР",
    "facts": [
      {
        "title": "Путь.",
        "text": "АТОР описывает полный маршрут «Центральный» (около 5 км, 11 точек): ровное асфальтовое покрытие, отсутствие лестниц и места отдыха. Наш короткий участок отдельно не обследован."
      },
      {
        "title": "Помощь.",
        "text": "ВДНХ сообщает о бесплатном транспорте для маломобильных посетителей по предварительному запросу и прокате кресел-колясок; инфослужба: +7 (495) 544-34-00."
      },
      {
        "title": "Инфраструктура.",
        "text": "На территории есть адаптированные объекты и инклюзивная площадка. Расположение ближайшего доступного туалета и его фактическую работу на нашем участке необходимо уточнить."
      }
    ],
    "sources": [
      {
        "title": "Доступная среда ВДНХ",
        "url": "https://vdnh.ru/dostupnaya-sreda/"
      },
      {
        "title": "Маршруты ВДНХ (АТОР)",
        "url": "https://accessible.atorus.ru/moskva/VDNH"
      }
    ],
    "check": "Проверить непрерывность прохода между четырьмя остановками, уклоны, бордюры, покрытие, отдых и ближайший доступный туалет."
  },
  "victory-park": {
    "heading": "Сведения Музея Победы",
    "facts": [
      {
        "title": "Вход.",
        "text": "Для посетителей на креслах-колясках музей указывает центральный вход с подъездом слева от колоннады; также возможен вход через кинотеатр «Поклонка» с тыльной стороны."
      },
      {
        "title": "Внутри.",
        "text": "По сведениям музея есть лифт к основным экспозициям, широкие проходы, пандусы и помощь сотрудников."
      },
      {
        "title": "Сопровождение.",
        "text": "Музей просит по возможности предупредить о визите: +7 (499) 449-81-81, buro@victorymuseum.ru."
      }
    ],
    "sources": [
      {
        "title": "Доступная среда Музея Победы",
        "url": "https://victorymuseum.ru/about/available-environment/"
      },
      {
        "title": "Правила посещения",
        "url": "https://victorymuseum.ru/for-visitors/rules/"
      }
    ],
    "check": "Проверить наружный путь между всеми пятью точками: уклоны, переходы, покрытие, доступный туалет, отдых и условия подхода к музею."
  },
  "moscow-center": {
    "heading": "Сведения Исторического музея",
    "facts": [
      {
        "title": "Музей.",
        "text": "ГИМ сообщает, что Исторический музей и Музей Отечественной войны 1812 года оснащены лифтами и доступны для посетителей на креслах-колясках."
      },
      {
        "title": "Покровский собор.",
        "text": "Для уточнения условий посещения необходимо заранее связаться с музеем по адресу access@shm.ru. Доступность всех помещений не подтверждается этим сообщением."
      },
      {
        "title": "Помощь.",
        "text": "Для посещения Исторического музея можно заранее запросить сопровождение от метро; на сайте ГИМ указана подача заявки за три дня."
      }
    ],
    "sources": [
      {
        "title": "ГИМ. Доступно",
        "url": "https://shm.ru/dostupnyy-muzey/"
      },
      {
        "title": "Контакты и правила посещения",
        "url": "https://shm.ru/visit/services/gim/"
      }
    ],
    "check": "Проверить пешеходные переходы, бордюры, участки брусчатки, входы, альтернативные обходы, отдых и туалеты на всём участке."
  }
}

// Фильтруем ПРОГРАММУ ОБСЛЕДОВАНИЯ, а не доступность маршрута.
// Для реального подбора путешествий понадобятся подтверждённые полевые данные.
const themeCandidates = computed(() =>
  pilotCandidates.filter((candidate) =>
    selectedTheme.value === 'all' || candidate.tags.includes(selectedTheme.value)
  )
)
const visibleCandidates = computed(() =>
  themeCandidates.value.filter((candidate) =>
    selectedNeeds.value.every((need) => candidate.auditFocus.includes(need))
  )
)

// Географические ориентиры, а не проложенные или обследованные безбарьерные пути.
// Для ВДНХ сохраняем уже работающие предварительные координаты v14.
// Для Парка Победы и центра Москвы используем предварительные координаты ориентиров:
// так карта не зависит от нестабильного геокодирования названий.
// Координаты не обозначают доступный вход или подтверждённую проходимость.
const mapRuntimeConfig = useRuntimeConfig()
const candidateMapStops = {
  vdnh: [
    // Рабочие предварительные координаты ВДНХ из v14 — оставлены без изменений.
    { title: 'Арка Главного входа', coords: [55.826315, 37.637541] },
    { title: 'Музей ВДНХ', coords: [55.826611, 37.638105] },
    { title: 'Инклюзивная детская площадка', coords: [55.828480, 37.637165] },
    { title: 'Северный розарий', coords: [55.828958, 37.635300] }
  ],
  'victory-park': [
    // Предварительные ориентиры (НЕ координаты подтверждённого безбарьерного пути).
    // Аллея — протяжённый объект; метка стоит на выбранном участке.
    { title: 'Главная аллея Парка Победы', coords: [55.73360, 37.51510] },
    // Фонтаны — протяжённый комплекс; метка стоит примерно в его средней части.
    { title: 'Фонтанный комплекс «Годы войны»', coords: [55.73285, 37.51100] },
    // Монумент Победы: Площадь Победы, 3, стр. 2; около 55.73174, 37.50708.
    { title: 'Монумент Победы', coords: [55.731740, 37.507076] },
    // Вечный огонь расположен у монумента; точную позицию следует уточнить на месте.
    { title: 'Вечный огонь', coords: [55.731570, 37.506930] },
    // Музей Победы: площадь Победы, 3; координаты здания.
    { title: 'Музей Победы', coords: [55.730979, 37.504833] }
  ],
  'moscow-center': [
    // Предварительные ориентиры. Площади и сад — территории, метки означают примерные центры.
    { title: 'Манежная площадь', coords: [55.755830, 37.614720] },
    { title: 'Александровский сад', coords: [55.753987, 37.614012] },
    { title: 'Могила Неизвестного Солдата', coords: [55.754784, 37.616150] },
    { title: 'Красная площадь', coords: [55.753544, 37.621202] },
    { title: 'Покровский собор', coords: [55.752490, 37.623205] }
  ]
}

// Эти координаты — центры поиска и отображения районов, не геометки маршрута.
const candidateMapCenters = {
  vdnh: [55.8277, 37.6370],
  'victory-park': [55.731, 37.509],
  'moscow-center': [55.752, 37.617]
}

const openMapId = ref(null)
const mapState = ref('idle')
const mapMessage = ref('')
let mapInstance = null
let mapGeneration = 0
let yandexApiPromise = null

function getYandexMapsApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Карта доступна в браузере.'))
  if (window.ymaps) return Promise.resolve(window.ymaps)
  if (yandexApiPromise) return yandexApiPromise

  const key = mapRuntimeConfig.public.yandexMapsKey
  if (!key) return Promise.reject(new Error('Не настроен публичный ключ Яндекс Карт.'))

  yandexApiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="api-maps.yandex.ru/2.1/"]')
    const script = existing || document.createElement('script')
    let finished = false

    const finish = (error) => {
      if (finished) return
      finished = true
      clearTimeout(timeoutId)
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
      if (error) reject(error)
      else resolve(window.ymaps)
    }
    const onLoad = () => window.ymaps
      ? finish(null)
      : finish(new Error('API Яндекс Карт не инициализировался.'))
    const onError = () => finish(new Error('Не удалось загрузить Яндекс Карты.'))
    const timeoutId = setTimeout(() => {
      if (window.ymaps) finish(null)
      else finish(new Error('Время ожидания Яндекс Карт истекло.'))
    }, 15000)

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    if (!existing) {
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`
      script.async = true
      document.head.appendChild(script)
    }
  }).catch((error) => {
    yandexApiPromise = null
    throw error
  })
  return yandexApiPromise
}

function destroyCandidateMap() {
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
}

function closeCandidateMap() {
  ++mapGeneration
  destroyCandidateMap()
  openMapId.value = null
  mapState.value = 'idle'
  mapMessage.value = ''
}

// Отклоняем результаты геокодирования в другом районе Москвы.
// Проверка приблизительна и не подтверждает точность найденного входа.
function nearCandidateArea(coords, id) {
  const center = candidateMapCenters[id]
  if (!center || !Array.isArray(coords) || coords.length !== 2) return false
  const [lat, lon] = coords.map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false
  const deltaLatMeters = (lat - center[0]) * 111_000
  const deltaLonMeters = (lon - center[1]) * 111_000 * Math.cos(center[0] * Math.PI / 180)
  return Math.hypot(deltaLatMeters, deltaLonMeters) < 2400
}

async function getCandidateMarkers(ymaps, id) {
  const stops = candidateMapStops[id] || []
  return (await Promise.all(stops.map(async (stop, index) => {
    if (stop.coords) return { ...stop, order: index + 1 }
    if (!stop.query) return null
    try {
      const result = await ymaps.geocode(stop.query, { results: 1 })
      const obj = result?.geoObjects?.get(0)
      if (!obj) return null
      const coords = obj.geometry?.getCoordinates()
      if (!nearCandidateArea(coords, id)) return null
      return { title: stop.title, coords, order: index + 1 }
    } catch (error) {
      console.warn('[Russplore] Не удалось определить ориентир на карте:', stop.title, error)
      return null
    }
  }))).filter(Boolean)
}

async function toggleCandidateMap(id) {
  if (openMapId.value === id) {
    closeCandidateMap()
    return
  }
  closeCandidateMap() // За один раз открыта только одна карта.
  if (!candidateMapStops[id]) return

  openMapId.value = id
  mapState.value = 'loading'
  mapMessage.value = ''
  const generation = ++mapGeneration
  await nextTick()

  try {
    const ymaps = await getYandexMapsApi()
    await new Promise((resolve, reject) => {
      try { ymaps.ready(resolve, reject) }
      catch (error) { reject(error) }
    })
    if (generation !== mapGeneration) return

    const markers = await getCandidateMarkers(ymaps, id)
    if (generation !== mapGeneration) return
    if (!markers.length) {
      throw new Error('Не удалось найти ориентиры этого района. Попробуйте открыть карту позднее.')
    }

    // Внутри v-for Vue возвращает массив template-ref. ID гарантирует DOM-элемент.
    const container = document.getElementById(`rp-access-map-canvas-${id}`)
    if (!(container instanceof HTMLElement)) throw new Error('Контейнер карты не найден.')

    const map = new ymaps.Map(container, {
      center: candidateMapCenters[id],
      zoom: 15,
      controls: ['zoomControl', 'fullscreenControl']
    }, { suppressMapOpenBlock: true })
    mapInstance = map

    markers.forEach((point) => {
      const placemark = new ymaps.Placemark(point.coords, {
        iconContent: String(point.order),
        hintContent: `${point.order}. ${point.title}`,
        balloonContentHeader: `${point.order}. ${point.title}`,
        balloonContentBody: 'Предварительное расположение ориентира. Доступность пути и точность входа не подтверждены Russplore.'
      }, { preset: 'islands#greenIcon' })
      map.geoObjects.add(placemark)
    })

    map.container.fitToViewport()
    if (markers.length > 1) {
      const bounds = map.geoObjects.getBounds()
      if (bounds) {
        await map.setBounds(bounds, { zoomMargin: 45, checkZoomRange: true })
        if (generation !== mapGeneration) return
        if (map.getZoom() > 17) map.setZoom(17)
      }
    } else {
      map.setCenter(markers[0].coords, 16)
    }

    if (markers.length < candidateMapStops[id].length) {
      mapMessage.value = `Найдено ${markers.length} из ${candidateMapStops[id].length} ориентиров. Остальные точки требуют уточнения.`
    }
    mapState.value = 'ready'
  } catch (error) {
    if (generation !== mapGeneration) return
    destroyCandidateMap()
    mapMessage.value = error?.message || 'Карта временно недоступна.'
    mapState.value = 'error'
  }
}

// Если фильтр убрал открытую карточку — освобождаем карту.
watch(visibleCandidates, (list) => {
  if (openMapId.value && !list.some((candidate) => candidate.id === openMapId.value)) {
    closeCandidateMap()
  }
})

onBeforeUnmount(closeCandidateMap)

const chosenOptions = computed(() =>
  accessOptions.filter((option) => selectedNeeds.value.includes(option.id))
)
const chosenLabels = computed(() => chosenOptions.value.map((option) => option.label))
const hasFilters = computed(() => selectedNeeds.value.length > 0 || selectedTheme.value !== 'all')
const totalFilteredOut = computed(() => themeCandidates.value.length - visibleCandidates.value.length)
function togglePassport(id) {
  expandedPassportId.value = expandedPassportId.value === id ? null : id
}

function toggleAudit(id) {
  expandedAuditId.value = expandedAuditId.value === id ? null : id
}

function toggleNeed(id) {
  selectedNeeds.value = selectedNeeds.value.includes(id)
    ? selectedNeeds.value.filter((value) => value !== id)
    : [...selectedNeeds.value, id]
}
function resetFilters() {
  selectedNeeds.value = []
  selectedTheme.value = 'all'
}

function stopCountLabel(count) {
  const n = Number(count) || 0
  const tens = n % 100
  const units = n % 10
  if (tens >= 11 && tens <= 14) return `${n} точек`
  if (units === 1) return `${n} точка`
  if (units >= 2 && units <= 4) return `${n} точки`
  return `${n} точек`
}
</script>

<template>
  <div class="rp-access-root">
    <section class="rp-access-hero">
      <div class="rp-access-hero-copy">
        <span class="rp-access-eyebrow"><span class="rp-access-dot"></span> НОВОЕ НАПРАВЛЕНИЕ RUSSPLORE</span>
        <h1>Путешествия<br><em>без барьеров</em></h1>
        <p>Маршруты для людей с разными потребностями, ветеранов СВО, членов их семей и других путешественников. Удобство путешествия начинается с достоверной информации.</p>
        <div class="rp-access-hero-actions">
          <a href="#rp-access-catalog" class="rp-access-primary">Смотреть направления <span aria-hidden="true">→</span></a>
          <button type="button" class="rp-access-secondary" @click="$emit('back')">К обычным маршрутам</button>
        </div>
        <p class="rp-access-hero-note">Пилотная версия раздела · сведения о доступности пока проходят подготовку к проверке</p>
      </div>
      <div class="rp-access-hero-visual" aria-hidden="true">
        <div class="rp-access-visual-disc">
          <svg viewBox="0 0 24 24" width="86" height="86" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11.5" cy="4.5" r="1.8"/><path d="M11.5 7v6h5l2.6 4.5"/><path d="M11.5 10H8.4"/><path d="M7.2 12.5a6.6 6.6 0 1 0 9.8 7.2"/>
          </svg>
        </div>
        <div class="rp-access-visual-card"><span class="rp-access-visual-kicker">ДОСТУПНОСТЬ</span><strong>В деталях каждого маршрута</strong><small>Проверка перед публикацией</small></div>
      </div>
    </section>

    <section class="rp-access-info" role="status">
      <span class="rp-access-info-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>
      </span>
      <div>
        <strong>Маршруты пока не подтверждены как доступные</strong>
        <p>Ниже — кандидаты для обследования, а не готовые рекомендации. Мы не будем маркировать маршрут подходящим для кресла-коляски или других потребностей без проверки всего пути.</p>
      </div>
    </section>

    <section class="rp-access-layout" id="rp-access-catalog" aria-label="Будущие доступные маршруты">
      <aside class="rp-access-filters">
        <div class="rp-access-filter-head"><div><span class="rp-access-eyebrow">ПОДБОР</span><h2>Ваши условия</h2></div><button v-if="hasFilters" type="button" class="rp-access-header-reset" @click="resetFilters">Сбросить</button></div>
        <p class="rp-access-filter-intro">Выберите нужные условия. Список справа покажет кандидатов, для которых эти параметры <strong>включены в предложенный план обследования</strong>. Это не подтверждение доступности.</p>
        <div class="rp-access-checks">
          <label v-for="option in accessOptions" :key="option.id" class="rp-access-check" :class="{ 'is-selected': selectedNeeds.includes(option.id) }">
            <input type="checkbox" :checked="selectedNeeds.includes(option.id)" @change="toggleNeed(option.id)">
            <span class="rp-access-checkbox" aria-hidden="true">
              <svg v-if="selectedNeeds.includes(option.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>
            </span>
            <span><strong>{{ option.label }}</strong><small>{{ option.detail }}</small></span>
          </label>
        </div>
        <div class="rp-access-filter-summary">
          <strong>{{ selectedNeeds.length ? `Критериев проверки: ${selectedNeeds.length}` : 'Критерии проверки не выбраны' }}</strong>
          <p v-if="chosenLabels.length">{{ chosenLabels.join(' · ') }}</p>
          <p v-else>Без выбора условий показаны все кандидаты по тематике.</p>
          <p v-if="chosenLabels.length" class="rp-access-filter-hint">Ни один из этих параметров ещё не подтверждён обследованием.</p>
        </div>
      </aside>

      <div class="rp-access-catalog">
        <div class="rp-access-section-head"><div><span class="rp-access-eyebrow">ПЕРВЫЙ ЭТАП · МОСКВА</span><h2>Кандидаты на обследование</h2><p>Фильтр выбирает планы проверок, а не маршруты с доказанной доступностью.</p></div><span class="rp-access-count" aria-live="polite">{{ visibleCandidates.length }} из {{ pilotCandidates.length }}</span></div>
        <div class="rp-access-tabs" role="group" aria-label="Тематика маршрута">
          <button v-for="theme in themes" :key="theme.id" type="button" :class="{ 'is-active': selectedTheme === theme.id }" :aria-pressed="selectedTheme === theme.id" @click="selectedTheme = theme.id">{{ theme.label }}</button>
        </div>
        <div class="rp-access-match-bar" role="status" aria-live="polite">
          <div>
            <strong>{{ chosenLabels.length ? `Найдено для проверки: ${visibleCandidates.length}` : `Показано кандидатов: ${visibleCandidates.length}` }}</strong>
            <p v-if="chosenLabels.length">Все {{ chosenLabels.length }} условия входят в демонстрационный план проверки этих кандидатов. Доступность пока неизвестна.</p>
            <p v-else>Выберите требования слева, чтобы сузить список будущих обследований.</p>
            <small v-if="selectedNeeds.length && totalFilteredOut">Не включены в план по выбранным условиям: {{ totalFilteredOut }}</small>
          </div>
          <button v-if="hasFilters" type="button" class="rp-access-clear" @click="resetFilters">Очистить фильтры</button>
        </div>
        <div v-if="visibleCandidates.length" class="rp-access-cards">
          <article v-for="candidate in visibleCandidates" :key="candidate.id" class="rp-access-card">
            <div class="rp-access-card-head"><span class="rp-access-card-number">{{ candidate.number }}</span><span class="rp-access-pending">Доступность не подтверждена</span></div>
            <span class="rp-access-card-type">{{ candidate.label }}</span>
            <h3>{{ candidate.title }}</h3>
            <p>{{ candidate.description }}</p>
            <!-- Маршрут компактно раскрывается по запросу. Проверки — только в паспорте и акте. -->
            <details v-if="candidate.stops?.length" class="rp-access-stops">
              <summary>
                <span>План прогулки</span>
                <span class="rp-access-stops-count">{{ stopCountLabel(candidate.stops.length) }}</span>
                <span class="rp-access-stops-chevron" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex:0 0 16px;font-size:14px;line-height:1;">▾</span>
              </summary>
              <ol>
                <li v-for="stop in candidate.stops" :key="stop">{{ stop }}</li>
              </ol>
              <a v-if="candidate.sourceUrl" :href="candidate.sourceUrl" target="_blank" rel="noopener noreferrer">{{ candidate.sourceLabel || 'Источник маршрута' }} ↗</a>
            </details>
            <!-- Показываем ориентиры на карте, но НЕ строим неподтверждённый безбарьерный путь. -->
            <div v-if="candidateMapStops[candidate.id]" class="rp-access-map-section" style="margin:0 0 13px;min-width:0;">
              <button
                type="button"
                class="rp-access-map-button"
                style="display:inline-flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:9px;width:auto;max-width:100%;min-height:40px;margin:0;padding:9px 13px;border:1px solid #bdded4;border-radius:10px;background:#eff9f5;color:#087b6e;font-family:inherit;font-size:12px;font-weight:800;line-height:1.35;cursor:pointer;text-align:center;"
                :aria-expanded="openMapId === candidate.id"
                :aria-controls="`rp-access-map-${candidate.id}`"
                @click="toggleCandidateMap(candidate.id)"
              >
                <svg aria-hidden="true" width="16" height="16" style="display:block;width:16px;height:16px;flex:0 0 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6.5 9 3l6 3.5L21 3v14.5L15 21l-6-3.5L3 21z"/>
                  <path d="M9 3v14.5M15 6.5V21"/>
                </svg>
                <span>{{ openMapId === candidate.id ? 'Скрыть карту' : 'Показать на карте' }}</span>
                <span class="rp-access-map-count" style="display:inline-flex;align-items:center;margin-left:2px;padding:4px 7px;border-radius:999px;background:#dbf0e8;color:#087b6e;font-size:10px;font-weight:700;white-space:nowrap;">{{ stopCountLabel(candidate.stops.length) }}</span>
              </button>
              <div v-if="openMapId === candidate.id" :id="`rp-access-map-${candidate.id}`" class="rp-access-map-panel" style="margin-top:11px;padding:12px;border:1px solid #dcebe6;border-radius:12px;background:#f8fcfa;min-width:0;overflow:hidden;">
                <p class="rp-access-map-notice" style="margin:0 0 10px;color:#4d6974;font-size:11px;line-height:1.55;">Только расположение ориентиров. Безбарьерный путь между ними пока не проверен.</p>
                <p v-if="mapState === 'loading'" class="rp-access-map-status" role="status">Загружаем карту и уточняем точки…</p>
                <p v-if="mapState === 'error'" class="rp-access-map-error" role="alert">{{ mapMessage }}</p>
                <div
                  v-if="mapState !== 'error'"
                  :id="`rp-access-map-canvas-${candidate.id}`"
                  class="rp-access-map-canvas"
                  style="display:block;width:100%;height:310px;min-height:310px;border:1px solid #dde8e7;border-radius:10px;overflow:hidden;background:#eaf1ef;"
                  :aria-label="`Яндекс Карта: ${candidate.title}, ${stopCountLabel(candidate.stops.length)}`"
                ></div>
                <p v-if="mapState === 'ready' && mapMessage" class="rp-access-map-status" role="status">{{ mapMessage }}</p>
                <p class="rp-access-map-caption" style="margin:9px 0 0;color:#738992;font-size:10px;line-height:1.55;">Метки предварительные. Уточняйте расположение точек и условия прохода перед поездкой.</p>
              </div>
            </div>
            <div class="rp-access-card-foot">
              <span>Москва · данные ожидают проверки</span>
              <button
                type="button"
                class="rp-access-passport-btn"
                :aria-expanded="expandedPassportId === candidate.id"
                :aria-controls="`rp-passport-${candidate.id}`"
                @click="togglePassport(candidate.id)"
              >
                {{ expandedPassportId === candidate.id ? 'Скрыть паспорт' : 'Паспорт доступности' }}
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="expandedPassportId === candidate.id ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'"/></svg>
              </button>
            </div>
            <AccessibilityPassport
              v-if="expandedPassportId === candidate.id"
              :id="`rp-passport-${candidate.id}`"
              :candidate="candidate"
            />
            <!-- Один компактный блок справочной информации под паспортом для всех трёх маршрутов. -->
            <details
              v-if="expandedPassportId === candidate.id && officialNotes[candidate.id]"
              class="rp-access-evidence"
              style="margin-top:12px;border:1px solid #dcebe5;border-radius:12px;background:#f8fcfa;overflow:hidden;"
            >
              <summary style="display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:11px 13px;list-style:none;cursor:pointer;color:#08796f;font-size:12px;font-weight:750;line-height:1.4;">
                <span style="display:block;flex:1 1 auto;min-width:0;overflow-wrap:break-word;">{{ officialNotes[candidate.id].heading }}</span>
                <span class="rp-access-evidence-chevron" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;flex:0 0 16px;width:16px;height:16px;font-size:14px;line-height:1;">▾</span>
              </summary>
              <div class="rp-access-evidence-body" style="padding:11px 13px 13px;border-top:1px solid #e4eeea;">
                <p class="rp-access-evidence-note">Опубликованные сведения об объектах, не результат обследования Russplore.</p>
                <ul>
                  <li v-for="(fact, index) in officialNotes[candidate.id].facts" :key="index">
                    <strong>{{ fact.title }}</strong> {{ fact.text }}
                  </li>
                </ul>
                <div class="rp-access-evidence-links">
                  <a
                    v-for="source in officialNotes[candidate.id].sources"
                    :key="source.url"
                    :href="source.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ source.title }}</a>
                </div>
                <p class="rp-access-evidence-check"><strong>Проверить на месте:</strong> {{ officialNotes[candidate.id].check }}</p>
                <p class="rp-access-evidence-note">Источники изучены 05.11.2026. Доступность всего маршрута не подтверждена.</p>
              </div>
            </details>
            <div v-if="isDevelopment" class="rp-access-audit-dev">
              <button
                type="button"
                class="rp-access-audit-trigger"
                style="display:inline-flex;align-items:center;justify-content:center;gap:9px;width:auto;max-width:100%;min-height:42px;margin:0;padding:10px 14px;border:1px solid #b9dfd3;border-radius:11px;background:#f1faf6;color:#087b6e;font-family:inherit;font-size:12px;font-weight:800;line-height:1.4;cursor:pointer;text-align:center;"
                :aria-expanded="expandedAuditId === candidate.id"
                :aria-controls="`rp-audit-${candidate.id}`"
                @click="toggleAudit(candidate.id)"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="display:block;width:16px;height:16px;flex:0 0 16px;">
                  <rect x="5" y="4" width="14" height="17" rx="2" />
                  <path d="M9 4.5V3.5h6v1M9 10h6M9 14h6M9 18h4" />
                </svg>
                <span>{{ expandedAuditId === candidate.id ? 'Закрыть акт обследования' : 'Заполнить акт обследования' }}</span>
                <span class="rp-access-audit-badge" style="display:inline-flex;align-items:center;padding:4px 7px;border-radius:999px;background:#dff2e9;color:#087b6e;font-size:10px;font-weight:800;line-height:1.1;white-space:nowrap;">Локально</span>
              </button>
              <AccessibilityAuditWorkspace
                v-if="expandedAuditId === candidate.id"
                :id="`rp-audit-${candidate.id}`"
                :key="candidate.id"
                :candidate="candidate"
              />
            </div>
          </article>
        </div>
        <div v-else class="rp-access-empty">
          <strong>По выбранным условиям пока нет плана обследования</strong>
          <p>Это не означает, что в Москве нет доступных мест. Просто в нашем пилотном списке нет кандидатов, у которых запланирована проверка всех выбранных критериев.</p>
          <button type="button" class="rp-access-clear" @click="resetFilters">Показать все направления</button>
        </div>
        <p class="rp-access-disclaimer"><strong>Важно:</strong> сейчас фильтры работают по запланированным проверкам, а не по фактической доступности. После обследования добавим подтверждённые параметры, дату проверки и построение проходимого пути. До этого не используйте этот каталог как гарантию доступности.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rp-access-root{width:100%;display:flex;flex-direction:column;gap:20px;color:#193347;min-width:0}
.rp-access-root *, .rp-access-root *::before,.rp-access-root *::after{box-sizing:border-box}
.rp-access-root button{cursor:pointer;margin:0;max-width:100%;font:inherit}
.rp-access-root svg{display:block;max-width:100%}
.rp-access-hero{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(240px,.55fr);overflow:hidden;min-height:346px;border:1px solid #dce9e8;border-radius:24px;background:linear-gradient(116deg,#fff 38%,#eff8f5 100%)}
.rp-access-hero-copy{padding:clamp(28px,4vw,54px);display:flex;flex-direction:column;align-items:flex-start}
.rp-access-eyebrow{display:inline-flex;align-items:center;gap:8px;color:#078b7c;font-size:10px;font-weight:800;letter-spacing:.09em}
.rp-access-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#078b7c}
.rp-access-hero h1{margin:20px 0 13px;font-size:clamp(32px,4.4vw,58px);line-height:1.07;letter-spacing:-.045em;color:#193347}
.rp-access-hero h1 em{color:#078b7c;font-style:normal}
.rp-access-hero-copy>p:not(.rp-access-hero-note){margin:0;color:#657b88;max-width:610px;line-height:1.7;font-size:14px}
.rp-access-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}
.rp-access-primary,.rp-access-secondary{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:43px;padding:11px 17px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:800}
.rp-access-primary{border:1px solid #078b7c;background:#078b7c;color:#fff}.rp-access-primary:hover{background:#056e64;color:#fff}
.rp-access-secondary{border:1px solid #d8e5e6;background:#fff;color:#294c5b}.rp-access-secondary:hover{background:#f0f8f6}
.rp-access-hero-note{margin:18px 0 0;color:#82939e;font-size:11px}
.rp-access-hero-visual{position:relative;display:grid;place-items:center;min-height:260px;overflow:hidden}
.rp-access-hero-visual:before{content:"";position:absolute;width:360px;height:360px;border:1px solid #cfe7df;border-radius:50%;left:-30px;top:-70px}
.rp-access-hero-visual:after{content:"";position:absolute;width:260px;height:260px;border:1px solid #d6ebe4;border-radius:50%;right:-95px;bottom:-100px}
.rp-access-visual-disc{position:relative;z-index:1;display:grid;place-items:center;width:160px;height:160px;border-radius:50%;background:#dff2e9;color:#078b7c;border:14px solid #f8fcfa;box-shadow:0 15px 40px #16756212}
.rp-access-visual-disc svg{width:86px!important;height:86px!important;flex:none}
.rp-access-visual-card{position:absolute;z-index:2;right:20px;bottom:30px;display:flex;flex-direction:column;gap:5px;padding:14px 16px;background:#fff;border:1px solid #dbe9e7;border-radius:13px;box-shadow:0 8px 25px #19334713;max-width:190px}
.rp-access-visual-kicker{color:#078b7c;font-size:9px;letter-spacing:.09em;font-weight:800}
.rp-access-visual-card strong{font-size:12px;line-height:1.35}.rp-access-visual-card small{color:#718892;font-size:10px}
.rp-access-info{display:flex;align-items:flex-start;gap:14px;background:#f3f8fa;border:1px solid #dfeaed;border-radius:16px;padding:18px 20px}
.rp-access-info-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:11px;background:#e4f3f1;color:#078b7c}.rp-access-info-icon svg{width:20px!important;height:20px!important}
.rp-access-info strong{font-size:13px}.rp-access-info p{margin:5px 0 0;line-height:1.65;font-size:12px;color:#657b88}
.rp-access-layout{display:grid;grid-template-columns:minmax(250px,305px) minmax(0,1fr);gap:18px;align-items:start;scroll-margin-top:24px}
.rp-access-filters,.rp-access-catalog{border-radius:20px;background:#fff;border:1px solid #e0e9ed;padding:22px;min-width:0}
.rp-access-filter-head{display:flex;align-items:end;justify-content:space-between;gap:10px}.rp-access-filter-head h2{font-size:22px;margin:6px 0 0}.rp-access-filter-head button{border:0;background:transparent;color:#078b7c;font-size:11px;font-weight:800;padding:3px 0}
.rp-access-filter-intro{margin:12px 0 16px;color:#718593;font-size:11px;line-height:1.65}
.rp-access-checks{display:flex;flex-direction:column;gap:7px}
.rp-access-check{display:flex;align-items:flex-start;gap:10px;padding:11px;border:1px solid #e6eef0;border-radius:11px;cursor:pointer;background:#fff;position:relative}
.rp-access-check.is-selected{background:#f1faf7;border-color:#a7d9ca}
.rp-access-check input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
.rp-access-check:focus-within{outline:2px solid #078b7c;outline-offset:2px}
.rp-access-checkbox{display:grid;place-items:center;width:19px;height:19px;flex:0 0 19px;border:1.5px solid #b9cace;border-radius:6px;background:#fff;color:#fff;margin-top:2px}
.rp-access-check.is-selected .rp-access-checkbox{border-color:#078b7c;background:#078b7c}
.rp-access-check strong,.rp-access-check small{display:block}.rp-access-check strong{font-size:11px;line-height:1.45}.rp-access-check small{font-size:10px;color:#7a8e9a;line-height:1.5;margin-top:2px}
.rp-access-filter-summary{margin-top:16px;padding:14px;background:#f1f8f6;border:1px solid #dcefe8;border-radius:12px}.rp-access-filter-summary strong{font-size:11px;color:#087b6e}.rp-access-filter-summary p{margin:5px 0 0;font-size:10px;line-height:1.6;color:#647f83;overflow-wrap:anywhere}
.rp-access-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.rp-access-section-head h2{font-size:clamp(23px,2.5vw,30px);margin:7px 0 5px;color:#193347}.rp-access-section-head p{font-size:12px;color:#708694;margin:0}.rp-access-count{white-space:nowrap;font-size:10px;font-weight:800;color:#078b7c;padding:7px 10px;background:#eaf7f3;border-radius:20px}
.rp-access-tabs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:23px 0 18px}.rp-access-tabs button{width:auto!important;border:1px solid #dfeaed;padding:8px 11px;background:#fff;color:#607b87;font-size:11px;font-weight:700;border-radius:9px}.rp-access-tabs button.is-active{background:#078b7c;color:#fff;border-color:#078b7c}
.rp-access-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.rp-access-card{display:flex;flex-direction:column;min-width:0;padding:19px;border:1px solid #e2ebec;border-radius:15px;background:#fff}
.rp-access-card-head{display:flex;justify-content:space-between;align-items:center;gap:9px;margin-bottom:20px}.rp-access-card-number{display:grid;place-items:center;width:35px;height:35px;border-radius:10px;background:#eaf6f2;color:#078b7c;font-size:12px;font-weight:800}.rp-access-pending{font-size:10px;background:#f5f7f8;color:#6c8290;padding:5px 8px;border-radius:7px}
.rp-access-card-type{font-size:10px;color:#078b7c;font-weight:800;letter-spacing:.05em}.rp-access-card h3{margin:8px 0 9px;font-size:17px;line-height:1.3}.rp-access-card>p{margin:0 0 17px;line-height:1.65;font-size:11px;color:#697f8c}
.rp-access-checklist{margin-top:auto;background:#f7faf9;border-radius:11px;padding:13px}.rp-access-checklist strong{font-size:10px;color:#4d6470}.rp-access-checklist ul{margin:8px 0 0;padding-left:18px;color:#687f89;font-size:10px;line-height:1.8}
.rp-access-card-foot{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:15px;padding-top:12px;border-top:1px solid #e9f0f1;color:#7e929d;font-size:10px}.rp-access-card-foot span:last-child{color:#078b7c;font-size:17px}
.rp-access-disclaimer{margin:18px 0 0;font-size:11px;line-height:1.65;color:#758a97}.rp-access-empty{padding:35px 20px;border-radius:12px;background:#f6f9fa;color:#687f89;font-size:12px;text-align:center}
.rp-access-filter-hint{border-top:1px solid #d3e5df;margin-top:9px!important;padding-top:9px;color:#7a6970!important}
.rp-access-match-bar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:0 0 16px;padding:14px 16px;border:1px solid #d4ebe2;border-radius:12px;background:#f0f9f5}
.rp-access-match-bar strong{font-size:12px;color:#087d6e}
.rp-access-match-bar p{margin:4px 0 0;color:#597881;line-height:1.5;font-size:11px}
.rp-access-match-bar small{display:block;margin-top:5px;font-size:10px;color:#71828b}
.rp-access-clear{flex:0 0 auto!important;display:inline-flex;justify-content:center;align-items:center;background:#fff!important;color:#087b6e!important;border:1px solid #bdded4!important;border-radius:9px!important;padding:9px 12px!important;font-size:11px!important;font-weight:800!important;width:auto!important}
.rp-access-clear:hover{background:#e0f3ed!important}
.rp-access-audit-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.rp-access-audit-tags>span{font-size:10px;font-weight:700;color:#27685b;background:#e7f4ee;border:1px solid #d6e9e0;padding:5px 8px;border-radius:7px}
.rp-access-audit-tags small{font-size:9px;font-weight:500;color:#687f7e}
.rp-access-audit-details{margin-top:13px;padding-top:10px;border-top:1px solid #e2edeb}
.rp-access-audit-details summary{cursor:pointer;font-size:10px;color:#567583;font-weight:700}
.rp-access-empty{display:flex;flex-direction:column;align-items:center;gap:10px;line-height:1.5}
.rp-access-empty strong{font-size:14px;color:#274658}
.rp-access-empty p{font-size:11px;max-width:470px;margin:0}
@media(max-width:650px){.rp-access-match-bar{flex-direction:column;align-items:stretch}.rp-access-clear{align-self:flex-start}}
@media(max-width:1050px){.rp-access-layout{grid-template-columns:1fr}.rp-access-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){.rp-access-hero{grid-template-columns:1fr}.rp-access-hero-visual{display:none}.rp-access-hero-copy{padding:26px}.rp-access-cards{grid-template-columns:1fr}.rp-access-filters,.rp-access-catalog{padding:17px}}
@media(max-width:470px){.rp-access-checks{grid-template-columns:1fr}.rp-access-section-head{align-items:start;flex-direction:column}.rp-access-hero-actions{flex-direction:column;align-items:stretch;width:100%}.rp-access-primary,.rp-access-secondary{width:100%;text-align:center}}

/* Russplore 2.0: вторичные кнопки и раскрытие паспорта доступности */
.rp-access-header-reset,.rp-access-passport-btn{
  display:inline-flex!important;justify-content:center;align-items:center;gap:7px;
  width:auto!important;max-width:100%;min-height:36px;margin:0!important;
  padding:8px 12px!important;border:1px solid #c7e3db!important;
  border-radius:10px!important;background:#f2faf7!important;color:#08796f!important;
  font-size:11px!important;font-weight:800!important;line-height:1.35!important;
  cursor:pointer;transition:background .18s ease,border-color .18s ease;
}
.rp-access-header-reset:hover,.rp-access-passport-btn:hover{
  background:#e1f3ec!important;border-color:#88c9b5!important;
}
.rp-access-header-reset:focus-visible,.rp-access-passport-btn:focus-visible{
  outline:3px solid #79d2c2;outline-offset:2px;
}
.rp-access-passport-btn{min-height:38px;white-space:normal;text-align:center;}
.rp-access-passport-btn svg{width:15px!important;height:15px!important;flex:0 0 15px;}
.rp-access-card-foot{align-items:center;flex-wrap:wrap;}
.rp-access-card-foot span:last-child{font-size:10px;color:#7e929d;}
@media(max-width:520px){.rp-access-passport-btn{width:100%!important;}.rp-access-card-foot{align-items:stretch;flex-direction:column;}}

/* Локальный акт обследования: компактная кнопка в стиле Russplore. */
.rp-access-audit-dev{margin-top:12px}
.rp-access-audit-trigger{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  gap:9px!important;width:auto!important;max-width:100%;min-height:42px!important;
  margin:0!important;padding:10px 14px!important;
  border:1px solid #b9dfd3!important;border-radius:11px!important;
  background:#f1faf6!important;color:#087b6e!important;
  font-family:inherit!important;font-size:12px!important;font-weight:800!important;
  line-height:1.4!important;text-align:center;cursor:pointer;
  transition:background .18s ease,border-color .18s ease,box-shadow .18s ease;
}
.rp-access-audit-trigger svg{display:block!important;width:16px!important;height:16px!important;flex:0 0 16px!important}
.rp-access-audit-trigger:hover{background:#e2f4ed!important;border-color:#88c8b5!important;box-shadow:0 3px 12px rgba(8,123,110,.08)}
.rp-access-audit-trigger:focus-visible{outline:3px solid #79d2c2!important;outline-offset:2px}
.rp-access-audit-trigger[aria-expanded="true"]{background:#e2f4ed!important;border-color:#88c8b5!important}
.rp-access-audit-badge{
  display:inline-flex;align-items:center;padding:4px 7px;border-radius:999px;
  background:#dff2e9;color:#087b6e;font-size:10px;font-weight:800;line-height:1.1;white-space:nowrap;
}
@media(max-width:480px){.rp-access-audit-trigger{width:100%!important;flex-wrap:wrap}}

/* Пилотный маршрут ВДНХ: раскрываемый короткий план, без повторных критериев. */
.rp-access-stops{margin:0 0 15px;padding:0;border:1px solid #dcebe6;border-radius:11px;background:#f7fbf9;overflow:hidden}
.rp-access-stops summary{display:flex;align-items:center;gap:9px;min-height:43px;padding:10px 12px;list-style:none;cursor:pointer;color:#087b6e;font-size:12px;font-weight:800}
.rp-access-stops summary::-webkit-details-marker{display:none}
.rp-access-stops summary:focus-visible{outline:3px solid #79d2c2;outline-offset:-3px}
.rp-access-stops-count{margin-left:auto;color:#6a8790;font-weight:600;font-size:11px;white-space:nowrap}
.rp-access-stops-chevron{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:16px!important;height:16px!important;flex:0 0 16px!important;font-size:14px!important;line-height:1!important;transition:transform .18s ease}
.rp-access-stops[open] .rp-access-stops-chevron{transform:rotate(180deg)}
.rp-access-stops ol{margin:0 14px 11px 31px;padding:0;color:#465e6b;font-size:11px;line-height:1.85}
.rp-access-stops li{padding-left:3px}
.rp-access-stops>a{display:inline-block;margin:0 14px 14px;font-size:11px;font-weight:700;color:#078b7c;text-decoration:underline;text-underline-offset:3px}
.rp-access-card-foot{margin-top:auto}

/* Источники и короткий план выездной проверки — один раскрываемый блок. */
.rp-access-evidence{margin-top:9px;border:1px solid #dbeae5;border-radius:11px;background:#fff;color:#193347;overflow:hidden}
.rp-access-evidence summary{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 13px;min-height:42px;list-style:none;cursor:pointer;font-size:11px;font-weight:800;color:#08796f}
.rp-access-evidence summary::-webkit-details-marker{display:none}
.rp-access-evidence summary:focus-visible{outline:3px solid #79d2c2;outline-offset:-3px}
.rp-access-evidence-chevron{transition:transform .18s ease}.rp-access-evidence[open] .rp-access-evidence-chevron{transform:rotate(180deg)}
.rp-access-evidence-body{padding:11px 13px 13px;border-top:1px solid #edf3f0}
.rp-access-evidence-note{margin:0 0 9px;font-size:10px;line-height:1.6;color:#748692}
.rp-access-evidence-note:last-child{margin:9px 0 0}
.rp-access-evidence ul{margin:8px 0 12px;padding-left:18px;color:#4d6774;font-size:11px;line-height:1.65}
.rp-access-evidence li+li{margin-top:6px}
.rp-access-evidence li strong,.rp-access-evidence-check strong{color:#244c58}
.rp-access-evidence-links{display:flex;gap:6px 12px;flex-wrap:wrap;margin-bottom:12px}
.rp-access-evidence-links a{font-size:10px;font-weight:700;color:#08796f;text-decoration:underline;text-underline-offset:2px;overflow-wrap:anywhere}
.rp-access-evidence-check{margin:0;padding:10px 11px;border-radius:8px;background:#f2f8f5;color:#526f78;font-size:10px;line-height:1.6}
@media(max-width:520px){.rp-access-evidence summary{gap:8px!important}}


/* Компактные карты трёх пилотов (не подтверждённые безбарьерные пути). */
.rp-access-map-section{margin:0 0 13px;min-width:0}
.rp-access-map-button{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  gap:9px!important;width:auto!important;max-width:100%;min-height:40px!important;
  margin:0!important;padding:9px 13px!important;border:1px solid #bdded4!important;
  border-radius:10px!important;background:#eff9f5!important;color:#087b6e!important;
  font-size:12px!important;font-weight:800!important;line-height:1.35!important;
  cursor:pointer;transition:background .18s ease,border-color .18s ease;
}
.rp-access-map-button:hover{background:#def2e9!important;border-color:#83c6b4!important}
.rp-access-map-button:focus-visible{outline:3px solid #79d2c2!important;outline-offset:2px}
.rp-access-map-button svg{display:block!important;width:16px!important;height:16px!important;max-width:16px!important;flex:0 0 16px!important}
.rp-access-map-count{margin-left:2px;padding:4px 7px;border-radius:999px;background:#dbf0e8;color:#087b6e;font-size:10px;font-weight:700;white-space:nowrap}
.rp-access-map-panel{margin-top:11px;padding:12px;border:1px solid #dcebe6;border-radius:12px;background:#f8fcfa;min-width:0;overflow:hidden}
.rp-access-map-notice{margin:0 0 10px;font-size:11px;line-height:1.55;color:#4d6974}
.rp-access-map-canvas{display:block!important;width:100%!important;height:310px!important;min-height:310px!important;border:1px solid #dde8e7;border-radius:10px;overflow:hidden;background:#eaf1ef}
.rp-access-map-status,.rp-access-map-error{margin:0 0 10px;font-size:11px;line-height:1.5}
.rp-access-map-status{color:#5b7380}.rp-access-map-error{color:#a13f41}
.rp-access-map-caption{margin:9px 0 0!important;color:#738992!important;font-size:10px!important;line-height:1.55!important}
@media(max-width:520px){.rp-access-map-button{width:100%!important}.rp-access-map-panel{padding:9px}.rp-access-map-canvas{height:285px!important;min-height:285px!important}}
</style>
