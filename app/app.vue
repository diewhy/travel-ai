vue
<script setup> 
import {ref, computed, nextTick, onMounted, onBeforeUnmount, watch} from 'vue'
import YandexMap from '~/components/YandexMap.vue'
import { cities } from '../data/cities.js'

const place = ref('')
const days = ref('')
const routeDuration = ref('short')
const budget = ref ('')
const travelType = ref('Активный')
const savedRoutes = ref([])
const result = ref ('')
const mapPoints = ref([])
const routeStops = ref([])
const activeStop = ref(null)
const availableVoices = ref([])
let audioPauseTimer = null
const visitedStopIds = ref([])
const currentReadyRouteId = ref('')
const history = ref('')
const memoryPlaces = ref([])
const routeTitle = ref('')
const routeAbout = ref('')
const pleinairs = ref([])
const equipment = ref([])
const routeSummary = ref('')
const mapTravelMode = ref ('pedestrian')
const showProfilePanel = ref(false)
const showWelcomeScreen = ref(true)

function enterPlatform() {
  showWelcomeScreen.value = false

  nextTick(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })
}

async function enterPlatformWithRoute() {
  showWelcomeScreen.value = false

  await nextTick()

  openReadyMoscowRoute('short')
}
const userProfile = ref({
  name: 'Александр',
  initials: 'АК',
  role: 'Участник проекта',
  level: 3,
  points: 420,
  nextLevelPoints: 600,
  routesCompleted: 2,
  tasksCompleted: 7,
  photosUploaded: 4,
  reviewsLeft: 3
})

const profileProgressPercent = computed(() => {
  return Math.min(
    100,
    Math.round(
      (userProfile.value.points / userProfile.value.nextLevelPoints) * 100
    )
  )
})

async function scrollToBlock(selector) {
  await nextTick()

  document
    .querySelector(selector)
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
}

async function sidebarHome() {
  showPlanner.value = false
  showProfilePanel.value = false

  await nextTick()

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

async function sidebarRoutes() {
  routeMode.value = 'history'
  showPlanner.value = false
  showProfilePanel.value = false

  await scrollToBlock('.new-ready-section')
}

async function sidebarCreateRoute() {
  showPlanner.value = true
  showProfilePanel.value = false

  await scrollToBlock('.new-planner-card')
}

async function sidebarMap() {
  showProfilePanel.value = false

  if (!result.value || !mapPoints.value.length) {
    await openReadyMoscowRoute('short')
  }

  await scrollToBlock('.map-card')
}

async function sidebarArt() {
  routeMode.value = 'moscowArt'
  showPlanner.value = true
  place.value = ''
  showProfilePanel.value = false

  await scrollToBlock('.new-planner-card')
}

function sidebarProfile() {
  showProfilePanel.value = true
}

function closeProfilePanel() {
  showProfilePanel.value = false
}
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

const routeProgressPercent = computed(() => {
  if (!routeStops.value.length) return 0

  return Math.round (
    (visitedStopIds.value.length / routeStops.value.length) * 100
  )
})

const nextRouteStop = computed(() => {
  return (
    routeStops.value.find(
      (stop) => !visitedStopIds.value.includes (stop.id)
    ) ||
    routeStops.value[0] ||
    null
  )
})
const showPlanner = ref(false)
const routeMode = ref('history')
const cityGroups = cities
const destinationImages = {
  'Алтай' : '/places/altai.jpg',
  'Байкал' : '/places/baikal.jpg',
  'Карелия' : '/places/karelia.jpg',
  'Камчатка' : '/places/kamchatka.jpg',
  'Дагестан' : '/places/dagestan.jpg', 
  'Сочи' : '/places/sochi.jpg',
}

const currentDestinationImage = computed(() => {
  return destinationImages[place.value] || '/fon.png'
})

const destinationGalleries = {
  'Алтай' : ['/places/altai.jpg', '/places/altai-2.jpg', '/places/altai-3.jpg'],
  'Байкал' : ['/places/baikal.jpg', '/places/baikal-2.jpg', '/places/baikal-3.jpg'],
  'Карелия' : ['/places/karelia.jpg', '/places/karelia-2.jpg', '/places/karelia-3.jpg'],
  'Камчатка' : ['/places/kamchatka.jpg',  '/places/kamchatka-2.jpg', '/places/kamchatka-3.jpg'],
  'Дагестан' : ['/places/dagestan.jpg',  '/places/dagestan-2.jpg', '/places/dagestan-3.jpg'],
  'Сочи' : ['/places/sochi.jpg',  '/places/sochi-2.jpg', '/places/sochi-3.jpg']
}

const activeImageIndex = ref(0)

let galleryTimer = null

const readyMoscowRoutes = [
  {
    id: 'short',
    duration: '2–3 часа',
    durationValue: 'short',
    days: '1',
    title: 'Москва. Дорогами памяти',
    preview: 'Короткая прогулка по главным мемориальным объектам в центре Москвы.',

    history:
      'Маршрут проходит по главному мемориальному пространству Москвы. В Александровском саду находятся Могила Неизвестного Солдата, Вечный огонь и Пост №1. Завершается маршрут на Красной площади — месте проведения военных парадов и государственных церемоний.',

    memoryPlaces: [
      'Александровский сад',
      'Могила Неизвестного Солдата',
      'Вечный огонь',
      'Пост №1',
      'Манежная площадь',
      'Красная площадь'
    ],

    mapPoints: [
      {
        name: 'Александровский сад',
        coords: [55.7526, 37.6127]
      },
      {
        name: 'Могила Неизвестного Солдата',
        coords: [55.7538, 37.6132]
      },
      {
        name: 'Вечный огонь',
        coords: [55.7541, 37.6134]
      },
      {
        name: 'Пост №1',
        coords: [55.7543, 37.6136]
      },
      {
        name: 'Манежная площадь',
        coords: [55.7553, 37.6155]
      },
      {
        name: 'Красная площадь',
        coords: [55.7539, 37.6208]
      }
    ],

    text: `**Москва. Дорогами памяти**

Короткий пеший маршрут по историческому центру Москвы.

**1. Александровский сад**
Начало маршрута у стен Московского Кремля.

**2. Могила Неизвестного Солдата**
Главный мемориал воинской славы в центре столицы.

**3. Вечный огонь**
Символ памяти о погибших защитниках Отечества.

**4. Пост №1**
Почётный караул Президентского полка.

**5. Манежная площадь**
Переход к историческому центру столицы.

**6. Красная площадь**
Финальная точка маршрута.

**Продолжительность**
2–3 часа.`
  },

  {
    id: 'day',
    duration: '6–8 часов',
    durationValue: 'day',
    days: '1',
    title: 'Героическая Москва',
    preview: 'Полноценный маршрут на день с мемориалами и военно-историческим музеем.',

    history:
      'Маршрут объединяет центральные мемориалы столицы и Центральный музей Вооружённых Сил. Пользователь знакомится с памятными местами Москвы, историей военных парадов и музейными коллекциями.',

    memoryPlaces: [
      'Красная площадь',
      'Памятник маршалу Георгию Жукову',
      'Александровский сад',
      'Могила Неизвестного Солдата',
      'Центральный музей Вооружённых Сил',
      'Екатерининский парк',
      'Площадь Суворова'
    ],

    mapPoints: [
  {
    name: 'Красная площадь',
    coords: [55.7539, 37.6208]
  },
  {
    name: 'Памятник маршалу Георгию Жукову',
    coords: [55.7553, 37.6146]
  },
  {
    name: 'Александровский сад',
    coords: [55.7526, 37.6127]
  },
  {
    name: 'Могила Неизвестного Солдата',
    coords: [55.7538, 37.6132]
  },
  {
    name: 'Центральный музей Вооружённых Сил',
    coords: [55.78492, 37.61725]
  },
  {
    name: 'Екатерининский парк',
    coords: [55.78306, 37.62028]
  },
  {
    name: 'Суворовская площадь',
    coords: [55.781489, 37.615695]
  }
],

    text: `**Москва военная**

Маршрут на целый день по мемориалам и музеям столицы.

**1. Красная площадь**
Начало маршрута в историческом центре Москвы.

**2. Памятник маршалу Георгию Жукову**
Памятник одному из главных советских военачальников.

**3. Александровский сад**
Прогулка вдоль западной стены Кремля.

**4. Могила Неизвестного Солдата**
Мемориальный комплекс с Вечным огнём и Постом №1.

**5. Центральный музей Вооружённых Сил**
Знакомство с военной историей России и музейными коллекциями.

**6. Екатерининский парк**
Отдых и переход к заключительной части маршрута.

**7. Площадь Суворова**
Финальная точка рядом с памятником Александру Суворову.

**Продолжительность**
6–8 часов с посещением музея.`
  },

  {
    id: 'long',
    duration: '2–3 дня',
    durationValue: 'long',
    days: '3',
    title: 'Москва — город воинской славы',
    preview: 'Большой маршрут по ключевым мемориалам, музеям и памятным местам столицы.',

    history:
      'Большой маршрут раскрывает военную историю Москвы через мемориалы Кремля, экспозиции Музея Победы, объекты Поклонной горы, Музей обороны Москвы и Центральный музей Вооружённых Сил.',

    memoryPlaces: [
      'Александровский сад',
      'Могила Неизвестного Солдата',
      'Красная площадь',
      'Поклонная гора',
      'Музей Победы',
      'Триумфальная арка',
      'Музей обороны Москвы',
      'Центральный музей Вооружённых Сил',
      'Площадь Суворова'
    ],

    mapPoints: [
  {
    name: 'Александровский сад',
    coords: [55.7526, 37.6127]
  },
  {
    name: 'Могила Неизвестного Солдата',
    coords: [55.7538, 37.6132]
  },
  {
    name: 'Красная площадь',
    coords: [55.7539, 37.6208]
  },
  {
    name: 'Парк Победы на Поклонной горе',
    coords: [55.7362, 37.5036]
  },
  {
    name: 'Музей Победы',
    coords: [55.7365, 37.5031]
  },
  {
    name: 'Триумфальные ворота',
    coords: [55.73679, 37.51998]
  },
  {
    name: 'Государственный музей обороны Москвы',
    coords: [55.67639, 37.46722]
  },
  {
    name: 'Центральный музей Вооружённых Сил',
    coords: [55.78492, 37.61725]
  },
  {
    name: 'Екатерининский парк',
    coords: [55.78306, 37.62028]
  },
  {
    name: 'Суворовская площадь',
    coords: [55.781489, 37.615695]
  }
],

    text: `**Москва — город воинской славы**

Большой военно-исторический маршрут на 2–3 дня.

**День 1. Исторический центр**
Александровский сад → Могила Неизвестного Солдата → Вечный огонь → Красная площадь → памятник маршалу Жукову.

**День 2. Поклонная гора**
Парк Победы → Музей Победы → площадь Победителей → Триумфальная арка.

**День 3. Военные музеи Москвы**
Музей обороны Москвы → Центральный музей Вооружённых Сил → Екатерининский парк → площадь Суворова.

**Формат**
Маршрут рассчитан на самостоятельных путешественников, школьные группы и участников патриотических программ.

**Продолжительность**
2–3 дня.`
  }
]

const moscowStopContent = {
  'Александровский сад': {
  description:
    'Исторический сад у стен Московского Кремля и начало мемориальной части маршрута.',
  task:
    'Найдите вход в мемориальную зону и определите, какие элементы объединяют её с Кремлёвской стеной.',
  audio:
    'Вы находитесь в Александровском саду — одном из самых известных исторических пространств Москвы. Сад появился у стен Кремля после восстановления города в XIX веке и со временем стал не только местом прогулок, но и важной частью мемориального пространства столицы. Именно отсюда начинается маршрут памяти. Обратите внимание на расположение сада: он проходит вдоль Кремлёвской стены, рядом с главными государственными символами страны. Сегодня эта точка помогает почувствовать связь между историей Москвы, памятью о войнах и современными государственными церемониями. Осмотрите пространство вокруг и найдите вход в мемориальную зону.'
},

'Могила Неизвестного Солдата': {
  description:
    'Один из главных мемориалов воинской славы России, посвящённый погибшим защитникам Отечества.',
  task:
    'Найдите главную надпись мемориала и прочитайте её полностью.',
  audio:
    'Перед вами Могила Неизвестного Солдата — один из главных символов воинской памяти России. Мемориал посвящён всем защитникам Отечества, чьи имена остались неизвестными, но чей подвиг стал частью общей истории страны. Здесь важно не просто пройти мимо, а остановиться на несколько минут. Обратите внимание на строгость композиции, гранит, бронзовые элементы и главную надпись: Имя твоё неизвестно, подвиг твой бессмертен. Эта фраза стала одним из самых узнаваемых символов памяти о Великой Отечественной войне. Найдите надпись и прочитайте её полностью.'
},

'Вечный огонь': {
  description:
    'Центральный символ непрерывной памяти о воинах, погибших при защите страны.',
  task:
    'Рассмотрите бронзовую звезду и сделайте фотографию мемориала, не мешая церемониям.',
  audio:
    'Вечный огонь — это символ памяти, которая не должна прерываться. Он горит в честь воинов, погибших при защите страны, и напоминает о цене Победы. Здесь особенно важно соблюдать тишину и уважение к месту. Обратите внимание на бронзовую звезду, из центра которой выходит пламя. Вокруг этого объекта проходят официальные церемонии, возложения цветов и смена почётного караула. Для посетителя эта точка маршрута становится главным моментом остановки и осмысления. Рассмотрите мемориал и сделайте фотографию так, чтобы не мешать другим людям и церемониям.'
},

'Пост №1': {
  description:
    'Почётный караул у мемориала, который несут военнослужащие Президентского полка.',
  task:
    'Понаблюдайте за караулом и обратите внимание на церемониальный порядок действий.',
  audio:
    'Пост номер один — это почётный караул у Вечного огня. Его несут военнослужащие Президентского полка. Для многих посетителей именно смена караула становится самым запоминающимся моментом маршрута. Здесь важны точность движений, выправка, синхронность и торжественный ритм церемонии. Пост подчёркивает государственное значение мемориала и показывает, что память о погибших защитниках Отечества сохраняется не только в памятниках, но и в живой традиции. Понаблюдайте за караулом и обратите внимание на порядок действий.'
}
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

  loadRouteProgress(route.id)

  result.value = route.text

  await nextTick()

  document.querySelector('.result-wrap')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

function openRouteStop(stop) {
  activeStop.value = stop
}

function startCurrentRoute() {
  if (!nextRouteStop.value) return
  openRouteStop(nextRouteStop.value)
}

function closeRouteStop() {
  activeStop.value = null

  if (audioPauseTimer) {
    clearTimeout(audioPauseTimer)
    audioPauseTimer = null
  }

  if (
    typeof window !== 'undefined' &&
    window.speechSynthesis
  ) {
    window.speechSynthesis.cancel()
  }
}

function isStopVisited(stopId) {
  return visitedStopIds.value.includes(stopId)
}

function loadRouteProgress(routeId) {
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
  if (!visitedStopIds.value.includes(stop.id)) {
    visitedStopIds.value.push(stop.id)
  }

  localStorage.setItem(
    `route-progress-${currentReadyRouteId.value}`,
    JSON.stringify(visitedStopIds.value)
  )
}

function playStopAudio(stop) {
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis
  ) {
    return
  }

  window.speechSynthesis.cancel()

  if (audioPauseTimer) {
    clearTimeout(audioPauseTimer)
    audioPauseTimer = null
  }

  const text =
    stop.audio ||
    `${stop.name}. ${stop.description}`

  const voice = getBestRussianVoice()

  const parts = text
    .replaceAll('—', '. ')
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  let index = 0

  function speakNextPart() {
    if (index >= parts.length) return

    const speech = new SpeechSynthesisUtterance(parts[index])

    speech.lang = 'ru-RU'
    speech.rate = 0.82
    speech.pitch = 1.05
    speech.volume = 1

    if (voice) {
      speech.voice = voice
    }

    speech.onend = () => {
      index += 1

      audioPauseTimer = setTimeout(() => {
        speakNextPart()
      }, 350)
    }

    window.speechSynthesis.speak(speech)
  }

  speakNextPart()
}

function loadSpeechVoices() {
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis
  ) {
    return
  }

  availableVoices.value = window.speechSynthesis.getVoices()

  window.speechSynthesis.onvoiceschanged = () => {
    availableVoices.value = window.speechSynthesis.getVoices()
  }
}

function getBestRussianVoice() {
  const voices = availableVoices.value || []

  return (
    voices.find((voice) =>
      voice.lang === 'ru-RU' &&
      voice.name.toLowerCase().includes('milena')
    ) ||
    voices.find((voice) =>
      voice.lang === 'ru-RU' &&
      voice.name.toLowerCase().includes('google')
    ) ||
    voices.find((voice) =>
      voice.lang === 'ru-RU' &&
      voice.name.toLowerCase().includes('microsoft')
    ) ||
    voices.find((voice) =>
      voice.lang === 'ru-RU'
    ) ||
    voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith('ru')
    ) ||
    null
  )
}

function startGalleryAutoplay () {
  stopGalleryAutoplay ()
  galleryTimer = setInterval(() => {
    if (currentGallery.value.length > 1) {
      activeImageIndex.value =
        (activeImageIndex.value + 1) % currentGallery.value.length
    }
  }, 4000)
}

function stopGalleryAutoplay() {
  if (galleryTimer) {
    clearInterval(galleryTimer)
    galleryTimer = null
  }
}

onMounted(() => {
  startGalleryAutoplay()
  loadSavedRoutes()
  loadSpeechVoices()
})

onBeforeUnmount(() => {
  stopGalleryAutoplay()
})

const currentGallery = computed (() => {
  return destinationGalleries[place.value] || [currentDestinationImage.value]
})
const activeRouteImage = computed (() => {
  return currentGallery.value[activeImageIndex.value]
})

function setRouteImage(index) {
  activeImageIndex.value = index
  startGalleryAutoplay ()
}

function selectDestination(name) {
  place.value = name
  showPlanner.value = true
  result.value = ''
  activeImageIndex.value = 0
}

async function generateRoute() {
  result.value = 'Генерируем маршрут, подождите 10-20 секунд...'
  history.value = ''
  memoryPlaces.value = []
  mapPoints.value = []

  routeTitle.value = ''
  routeAbout.value = ''
  pleinairs.value = []
  equipment.value = []
  routeSummary.value = ''

  if (Number(days.value) > 7) {
    result.value = 'Пока доступна генерация маршрутов до 7 дней'
    return
  }

  try {
    const response = await $fetch ('/api/generate',{
      method: 'POST' ,
      body: {
        place: place.value,
        days: days.value,
        budget: budget.value,
        travelType: travelType.value,
        mode: routeMode.value,
        routeDuration: routeDuration.value
      }
    })

    console.log(response)

    result.value = typeof response.route === 'string'
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

    await nextTick ()

    document
      .querySelector ('.result-wrap')
      ?.scrollIntoView ({
        behavior: 'smooth'
      })
  } catch (error) {
    result.value = 'Ошибка:' + (error?.data?.message || error?.message || 'неизвестная ошибка')
  }
}

function loadSavedRoutes() {
  const saved = localStorage.getItem('saved-routes')

  if (saved) {
    savedRoutes.value = JSON.parse(saved)
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
    'saved-routes' ,
    JSON.stringify(savedRoutes.value)
  )
}

function downloadPdf() {
  const printWindow = window.open('', '_blank')

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

        <h2>Маршрут по направлению: ${place.value}</h2>

        <div class="meta">
          ${routeDurationName.value} · ${budget.value} ₽ · ${travelType.value}
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
</script>

<template>
  <div class="page">
  <section
  v-if="showWelcomeScreen"
  class="welcome-screen"
>
  <div class="welcome-bg-glow"></div>

  <div class="welcome-content">
    <div class="welcome-logo-row">
      <img
        src="/logo222.png"
        alt="Открой Россию"
      >

      <div>
        <strong>Открой Россию</strong>
        <span>Память · маршруты · культура</span>
      </div>
    </div>

    <span class="welcome-chip">
      Цифровая платформа исторических маршрутов
    </span>

    <h1>
      Историю нельзя просто прочитать.
      Её нужно пройти.
    </h1>

    <p>
      Интерактивные военно-исторические маршруты по Москве
      и Московской области: карта, аудиогид, задания на точках,
      баллы, отзывы и личный кабинет участника.
    </p>

    <div class="welcome-actions">
      <button
        type="button"
        class="welcome-main-btn"
        @click="enterPlatform"
      >
        Войти в платформу
      </button>

      <button
        type="button"
        class="welcome-route-btn"
        @click="enterPlatformWithRoute"
      >
        Посмотреть готовый маршрут
      </button>
    </div>

    <div class="welcome-features">
      <article>
        <strong>3</strong>
        <span>готовых маршрута</span>
      </article>

      <article>
        <strong>23</strong>
        <span>исторические точки</span>
      </article>

      <article>
        <strong>РВИО</strong>
        <span>задания за баллы</span>
      </article>
    </div>
  </div>

  <div class="welcome-preview-card">
    <span>Демо-маршрут</span>

    <h2>Москва. Дорогами памяти</h2>

    <p>
      Александровский сад, Могила Неизвестного Солдата,
      Вечный огонь, Пост №1 и Красная площадь.
    </p>

    <div>
      <small>2–3 часа</small>
      <small>6 точек</small>
      <small>Аудиогид</small>
    </div>
  </div>
</section>
<template v-else>
  <aside class="site-sidebar">
  <button
    type="button"
    class="side-brand"
    @click="sidebarHome"
  >
    <img
      src="/logo222.png"
      alt="Открой Россию"
    >

    <span>
      <strong>Открой Россию</strong>
      <small>Память · маршруты · культура</small>
    </span>
  </button>

  <nav class="side-nav">
    <button
      type="button"
      class="side-nav-btn active"
      @click="sidebarHome"
    >
      <span>⌂</span>
      Главная
    </button>

    <button
      type="button"
      class="side-nav-btn"
      @click="sidebarRoutes"
    >
      <span>🧭</span>
      Маршруты
    </button>

    <button
      type="button"
      class="side-nav-btn"
      @click="sidebarMap"
    >
      <span>📍</span>
      Карта
    </button>

    <button
      type="button"
      class="side-nav-btn"
      @click="sidebarCreateRoute"
    >
      <span>✦</span>
      Создать маршрут
    </button>

    <button
      type="button"
      class="side-nav-btn"
      @click="sidebarArt"
    >
      <span>🎨</span>
      Москва в красках
    </button>

    <button
      type="button"
      class="side-nav-btn"
      @click="sidebarProfile"
    >
      <span>👤</span>
      Личный кабинет
    </button>
  </nav>

  <div class="side-rvio-card">
    <span>Задания РВИО</span>

    <strong>
      Выполняйте задания на точках и получайте баллы
    </strong>

    <button
      type="button"
      @click="sidebarProfile"
    >
      Смотреть задания
    </button>
  </div>

  <button
    type="button"
    class="side-user-card"
    @click="sidebarProfile"
  >
    <div class="side-user-avatar">
      {{ userProfile.initials }}
    </div>

    <div>
      <strong>{{ userProfile.name }}</strong>
      <span>{{ userProfile.points }} баллов</span>
    </div>
  </button>
</aside>

<div
  v-if="showProfilePanel"
  class="profile-drawer-overlay"
  @click.self="closeProfilePanel"
>
  <aside class="profile-drawer">
    <button
      type="button"
      class="profile-drawer-close"
      @click="closeProfilePanel"
    >
      ×
    </button>

    <div class="profile-drawer-head">
      <div class="profile-drawer-avatar">
        {{ userProfile.initials }}
      </div>

      <div>
        <span>Личный кабинет</span>
        <h2>{{ userProfile.name }}</h2>
        <p>{{ userProfile.role }}</p>
      </div>
    </div>

    <div class="profile-level-card">
      <div class="profile-level-top">
        <strong>Уровень {{ userProfile.level }}</strong>

        <span>
          {{ userProfile.points }} / {{ userProfile.nextLevelPoints }} баллов
        </span>
      </div>

      <div class="profile-level-line">
        <div
          :style="{ width: profileProgressPercent + '%' }"
        ></div>
      </div>
    </div>

    <div class="profile-mini-stats">
      <article>
        <strong>{{ userProfile.routesCompleted }}</strong>
        <span>маршрута</span>
      </article>

      <article>
        <strong>{{ userProfile.tasksCompleted }}</strong>
        <span>заданий</span>
      </article>

      <article>
        <strong>{{ userProfile.photosUploaded }}</strong>
        <span>фото</span>
      </article>

      <article>
        <strong>{{ userProfile.reviewsLeft }}</strong>
        <span>отзывов</span>
      </article>
    </div>

    <section class="profile-task-preview">
      <span>Задания от РВИО</span>

      <h3>
        Сфотографируйтесь на локации
      </h3>

      <p>
        Пользователь приходит на точку маршрута, делает фото,
        загружает его в платформу и получает баллы. Эти фотографии
        потом можно использовать как презентацию локации.
      </p>

      <div class="task-reward">
        +50 баллов
      </div>
    </section>

    <section class="profile-task-preview">
      <span>Отзывы о точках</span>

      <h3>
        Оставьте впечатление о месте
      </h3>

      <p>
        После посещения точки пользователь сможет поставить оценку,
        написать отзыв и добавить фото.
      </p>
      <div class="task-reward">
        +15 баллов
      </div>
    </section>
  </aside>
</div>
<main class="new-home">
  <section class="new-hero">
    <div class="new-hero-content">
      <div class="top-brand">
        <img
          src="/logo222.png"
          alt="Открой Россию"
          class="top-brand-logo"
        />

        <div>
          <strong>Открой Россию</strong>
          <span>Память · маршруты · культура</span>
        </div>
      </div>

      <span class="hero-chip">
        Цифровая платформа маршрутов
      </span>

      <h1>
        Откройте Москву через маршруты,
        которые хочется пройти
      </h1>

      <p>
        Военно-исторические маршруты, интерактивные точки,
        аудиогиды, задания и творческие прогулки по Москве
        и Московской области.
      </p>

      <div class="hero-actions-row">
        <button
          type="button"
          class="hero-main-btn"
          @click="routeMode = 'history'; showPlanner = false"
        >
          Смотреть маршруты
        </button>

        <button
          type="button"
          class="hero-secondary-btn"
          @click="showPlanner = true"
        >
          Создать маршрут
        </button>
      </div>

      <div class="hero-stats-row">
        <div>
          <strong>3</strong>
          <span>готовых маршрута</span>
        </div>

        <div>
          <strong>23</strong>
          <span>исторические точки</span>
        </div>

        <div>
          <strong>2</strong>
          <span>направления проекта</span>
        </div>
      </div>
    </div>

    <aside class="new-hero-card">
      <span class="new-hero-card-label">
        Рекомендуемый маршрут
      </span>

      <h2>Москва. Дорогами памяти</h2>

      <p>
        Короткий военно-исторический маршрут по центру Москвы
        с картой, аудиогидом и точками памяти.
      </p>

      <div class="new-route-tags">
        <span>2–3 часа</span>
        <span>6 точек</span>
        <span>Аудиогид</span>
      </div>

      <button
        type="button"
        class="open-feature-route"
        @click="openReadyMoscowRoute('short')"
      >
        Начать маршрут
      </button>
    </aside>
  </section>

  <section class="new-directions">
    <article
      class="new-direction-card active"
      @click="routeMode = 'history'; showPlanner = false"
    >
      <div class="new-direction-icon">🎖️</div>

      <div>
        <span>Направление</span>
        <h3>Военная история</h3>
        <p>
          Маршруты по мемориалам, музеям и памятным местам.
        </p>
      </div>
    </article>

    <article
      class="new-direction-card art"
      @click="routeMode = 'moscowArt'; showPlanner = true; place = ''"
    >
      <div class="new-direction-icon">🎨</div>

      <div>
        <span>Творчество</span>
        <h3>Москва в красках</h3>
        <p>
          Пленэры, городские ракурсы и задания для художников.
        </p>
      </div>
    </article>
  </section>

  <section
    v-if="routeMode === 'history' && !showPlanner"
    class="new-ready-section"
  >
    <div class="section-head">
      <div>
        <span>Готовые маршруты</span>
        <h2>Выберите формат прохождения</h2>
      </div>

      <button
        type="button"
        class="section-small-btn"
        @click="showPlanner = true"
      >
        Создать с ИИ
      </button>
    </div>

    <div class="new-ready-grid">
      <article
        v-for="route in readyMoscowRoutes"
        :key="route.id"
        class="new-ready-card"
        :class="`ready-${route.id}`"
      >
        <div class="ready-card-top">
          <span class="ready-card-icon">
            {{
              route.id === 'short'
                ? '🕯️'
                : route.id === 'day'
                  ? '🎖️'
                  : '⭐'
            }}
          </span>

          <span class="ready-card-duration">
            {{ route.duration }}
          </span>
        </div>

        <h3>{{ route.title }}</h3>

        <p>{{ route.preview }}</p>

        <div class="ready-card-meta">
        <span>📍 {{ route.mapPoints.length }} точек</span>
          <span>🗺 Карта</span>
          <span>🔊 Аудиогид</span>
          <span>📄 PDF</span>
        </div>

        <button
          type="button"
          class="ready-card-btn"
          @click.stop.prevent="openReadyMoscowRoute(route.id)"
        >
          Открыть маршрут
        </button>
      </article>
    </div>
  </section>

  <transition name="slide-up">
    <section
      v-if="showPlanner"
      class="planner-card new-planner-card"
    >
      <button
        class="close-btn"
        @click="showPlanner = false; result = ''; days = ''; budget = ''"
      >
        ×
      </button>

      <h2>
        {{
          routeMode === 'moscowArt'
            ? 'Создать творческий маршрут'
            : 'Собрать маршрут'
        }}
      </h2>

      <div class="mode-switch">
        <div
          class="mode-btn"
          :class="{ active: routeMode === 'history' }"
          @click="routeMode = 'history'; place = ''"
        >
          Военная история
        </div>

        <div
          class="mode-btn"
          :class="{ active: routeMode === 'moscowArt' }"
          @click="routeMode = 'moscowArt'; place = ''"
        >
          Москва в красках
        </div>
      </div>

      <div class="city-picker">
        <div
          v-for="group in cityGroups"
          :key="group.group"
          class="city-group"
        >
          <h3>{{ group.group }}</h3>

          <div class="city-grid">
            <button
              v-for="city in group.items"
              :key="city"
              type="button"
              class="city-btn"
              :class="{ active: place === city }"
              @click="place = city"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </div>

      <div class="duration-options">
        <button
          type="button"
          class="duration-btn"
          :class="{ active: routeDuration === 'short' }"
          @click="routeDuration = 'short'; days = '1'"
        >
          🕐 Короткий
          <span>2–3 часа</span>
        </button>

        <button
          type="button"
          class="duration-btn"
          :class="{ active: routeDuration === 'day' }"
          @click="routeDuration = 'day'; days = '1'"
        >
          🌇 На день
          <span>6–8 часов</span>
        </button>

        <button
          type="button"
          class="duration-btn"
          :class="{ active: routeDuration === 'long' }"
          @click="routeDuration = 'long'; days = '3'"
        >
          🗓 Несколько дней
          <span>2–3 дня</span>
        </button>
      </div>

      <input
        v-model="budget"
        type="number"
        :placeholder="routeMode === 'moscowArt' ? 'Бюджет на материалы, ₽' : 'Бюджет, ₽'"
      />

      <button @click="generateRoute">
        {{
          routeMode === 'moscowArt'
            ? 'Создать маршрут плэнера'
            : 'Сгенерировать маршрут'
        }}
      </button>
    </section>
  </transition>
</main>

    <section v-if="result" class="result-wrap">
  <div class="route-header route-header-image"
    :style="{backgroundImage: `linear-gradient(rgba(5,15,35,.35), rgba(5,15,35,.88)), url(${activeRouteImage})`}"
    >
    <div class="route-gallery-dots">
  <button
    v-for="(image, index) in currentGallery"
    :key="image"
    type="button"
    class="gallery-line"
    :class="{ active: activeImageIndex === index }"
    @click="setRouteImage(index)"
  ></button>
</div>
    <div>
      <p class="route-label">Ваш маршрут готов</p>
      <h2>
        {{ 
          routeMode === 'moscowArt'
            ? `🎨 Художественный маршрут: ${place || 'Москва'}`
            : `Маршрут по направлению: ${place || 'Россия'}`  
        }}
      </h2>
    </div>

    <div class="route-stats">
      <span>📅 {{ routeDurationName }}</span>
      <span>💰 {{ budget || '—' }} ₽</span>
    </div>
  </div>

  <div v-if="history" class="history-card">
      <h3>
        {{ routeMode === 'moscowArt' ? '🏛️ О локации' : '📖  Историческая справка'}}
      </h3>
      <p>{{ history }}</p>
  </div>

  <div v-if="memoryPlaces.length" class="memory-card">
    <h3>
      {{
        routeMode === 'moscowArt'
        ? '🎨 Что будем рисовать'
        : '🎖️  Объекты военно-исторического наследия'
      }}
    </h3>

    <ul>
      <li v-for="item in memoryPlaces" :key="item">
        {{ item }}
      </li>
    </ul>
  </div>

  <div v-if="pleinairs.length" class="pleinair-list">

  <div
    v-for="(item, index) in pleinairs"
    :key="index"
    class="glass-card"
  >

    <h3>🎨 Пленэр {{ index + 1 }}</h3>

    <p><strong>📍 {{ item.place }}</strong></p>

    <p>{{ item.history }}</p>

    <br>

    <strong>Что рисуем:</strong>

    <ul>
      <li
        v-for="draw in item.draw"
        :key="draw"
      >
        {{ draw }}
      </li>
    </ul>

    <p><strong>Навык:</strong> {{ item.skill }}</p>

    <p><strong>Лучшее время:</strong> {{ item.bestTime }}</p>

    <p><strong>Продолжительность:</strong> {{ item.duration }}</p>

    <p><strong>Совет:</strong> {{ item.tip }}</p>

  </div>

</div>

  <div class="result" v-html="formattedResult"></div>

  <button
    class="pdf-btn"
    @click="downloadPdf"
  >
    📄 Скачать PDF
  </button>
</section>

<YandexMap
  v-if="result && mapPoints.length"
  :key="routeTitle + '-' + mapPoints.length"
  :place="place"
  :points="mapPoints"
  @select-point="openRouteStop"
/>

<section
  v-if="routeStops.length"
  class="route-stops-section"
>
  <div class="route-progress-card">
    <div>
      <span class="route-progress-label">
        Интерактивное прохождение
      </span>

      <h2>Маршрут готов к прохождению</h2>

      <p>
        Пользователь проходит точки по порядку, открывает карточки объектов,
        слушает аудиогид, выполняет задания и отмечает посещение.
      </p>
    </div>

    <button
      type="button"
      class="start-route-btn"
      @click="startCurrentRoute"
    >
      {{
        visitedStopIds.length
          ? 'Продолжить маршрут'
          : 'Начать маршрут'
      }}
    </button>
  </div>

  <div class="route-progress-line-wrap">
    <div class="route-progress-top">
      <span>
        Пройдено: {{ visitedStopIds.length }} / {{ routeStops.length }}
      </span>

      <strong>{{ routeProgressPercent }}%</strong>
    </div>

    <div class="route-progress-line">
      <div
        class="route-progress-fill"
        :style="{ width: routeProgressPercent + '%' }"
      ></div>
    </div>
  </div>

  <div class="route-features-grid">
    <div class="route-feature-card">
      <strong>🗺 Карта</strong>
      <span>точки и линия маршрута</span>
    </div>

    <div class="route-feature-card">
      <strong>📖 Справка</strong>
      <span>история каждого объекта</span>
    </div>

    <div class="route-feature-card">
      <strong>🔊 Аудиогид</strong>
      <span>рассказ на точке маршрута</span>
    </div>

    <div class="route-feature-card">
      <strong>🎯 Задание</strong>
      <span>действие на каждой локации</span>
    </div>

    <div class="route-feature-card">
      <strong>✅ Посещение</strong>
      <span>отметка пройденной точки</span>
    </div>

    <div class="route-feature-card">
      <strong>📄 PDF</strong>
      <span>маршрут можно сохранить</span>
    </div>
  </div>

  <div class="route-stops-heading">
    <div>
      <span>Точки маршрута</span>
      <h2>Куда идём</h2>
    </div>

    <strong>
      {{ routeDurationName }}
    </strong>
  </div>

  <div class="route-stops-grid">
    <article
      v-for="stop in routeStops"
      :key="stop.id"
      class="route-stop-card"
      :class="{ completed: isStopVisited(stop.id) }"
      @click="openRouteStop(stop)"
    >
      <div class="route-stop-number">
        {{ isStopVisited(stop.id) ? '✓' : stop.number }}
      </div>

      <div>
        <h3>{{ stop.name }}</h3>
        <p>{{ stop.description }}</p>
      </div>
    </article>
  </div>
</section>

<section
  v-if="savedRoutes.length"
  class="saves-routes"  
>
  <h2>Мои маршруты</h2>

  <div
    v-for="(route, index) in savedRoutes"
    :key="route.date + route.place"
    class="saved-route-card"
    @click="openSavedRoute(route)"
  >

  <strong>{{ route.place }}</strong>
  <span>
    {{ route.days }} дн.
  </span>

  <span>
    {{ route.budget }} ₽
  </span>

  <span
    class="delete-route-btn"
    @click.stop="deleteSavedRoute(index)"
  >
    ×
</span>
  
  </div>
</section>
  <div
  v-if="activeStop"
  class="stop-modal-overlay"
  @click.self="closeRouteStop"
>
  <article class="stop-modal">
    <button
      type="button"
      class="stop-modal-close"
      @click="closeRouteStop"
    >
      ×
    </button>

    <span class="stop-modal-label">
      Точка {{ activeStop.number }} маршрута
    </span>

    <h2>{{ activeStop.name }}</h2>

    <div class="stop-modal-block">
      <h3>📖 Историческая справка</h3>
      <p>{{ activeStop.description }}</p>
    </div>

    <div class="stop-modal-block">
      <h3>🎯 Задание на точке</h3>
      <p>{{ activeStop.task }}</p>
    </div>

    <button
      type="button"
      class="audio-guide-btn"
      @click="playStopAudio(activeStop)"
    >
      🔊 Прослушать аудиогид
    </button>

    <button
      v-if="!isStopVisited(activeStop.id)"
      type="button"
      class="visit-stop-btn"
      @click="markStopVisited(activeStop)"
    >
      ✓ Я посетил эту точку
    </button>

    <div
      v-else
      class="stop-completed-message"
    >
      ✓ Точка пройдена
    </div>
  </article>
</div>
</template>
  </div>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

* {
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  margin: 0;
  min-height: 100%;
  background:
    url('/fonosn.png')
    center top / cover
    no-repeat
    fixed !important;
}

body {
  font-family: 'Manrope', Arial, sans-serif;
}

.page {
  min-height: 100vh;
  padding: 28px;
  color: white;
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
  background: transparent !important;
}

.planner-card,
.result-wrap {
  position: relative;
  z-index: 20;
}

.topbar {
  max-width: 1180px;
  margin: 0 auto 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  width: 170px;
}

.nav {
  opacity: 0.8;
  font-size: 14px;
}

.hero {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 42px;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  margin-bottom: 22px;
  font-size: 14px;
}

h1 {
  font-size: 72px;
  line-height: 0.95;
  margin: 0 0 24px;
  letter-spacing: -2px;
}

.subtitle {
  font-size: 21px;
  line-height: 1.55;
  max-width: 620px;
  opacity: 0.92;
}

.popular {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 34px;
}

.popular span {
  padding: 12px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: 0.2s;
  font-weight: 700;
}

.popular span:hover {
  background: white;
  color: #0b2f5b;
  transform: translateY(-2px);
}

.planner-card {
  width: 100%;
  margin: 34px auto 0;
  padding: 30px;
  border-radius: 30px;
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  color: white;
  text-align: left;
  max-width: 760px;
  position: relative;
}

.planner-card h2 {
  margin: 0 0 22px;
  font-size: 28px;
  color: white;
  text-align: center;
}

input,
select {
  width: 100%;
  padding: 16px 18px;
  margin-top: 14px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  outline: none;
  background: rgba(225,225,225,.94);
  color: #0f172a;
  font-family: 'Manrope', Arial, sans-serif;
}

input:focus,
select:focus {
  border-color: #9b1c31;
  box-shadow: 0 0 0 3px rgba(155, 28, 49, 0.12);
}

button {
  width: 100%;
  margin-top: 18px;
  padding: 17px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #0066ff, #00a3ff);
  color: white;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
  font-family: 'Manrope', Arial, sans-serif;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 102, 255, 0.35);
}

.result-wrap {
  margin: 60px auto 0;
  padding: 26px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, .15);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.32);
  color: white;
  width: min(100%, 1180px);
  font-family: 'Manrope', Arial, sans-serif;
  overflow: hidden;
}

.route-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.route-label {
  margin: 0 0 8px;
  color: #38bdf8;
  font-weight: 800;
  font-size: 15px;
}

.route-header h2 {
  margin: 0;
  font-size: 42px;
  line-height: 1.15;
}

.route-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.route-stats span {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-weight: 700;
  white-space: nowrap;
}

.result {
  line-height: 1.8;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.94);
}

.result h3 {
  margin: 26px 0 14px;
  padding: 18px 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(0, 102, 255, 0.28), rgba(0, 163, 255, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  font-size: 24px;
}

@media (max-width: 700px) {
  .route-header {
    flex-direction: column;
  }

  .route-stats {
    justify-content: flex-start;
  }

  .route-header h2 {
    font-size: 26px;
  }

  .result-wrap {
    padding: 22px;
  }
}

@media (max-width: 860px) {
  .topbar {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 48px;
  }

  .page {
    padding: 20px;
  }
}

.center-hero {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  text-align: center;
  min-height: auto;
  padding-top: 40px;
}

.hero-center {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeUp .8s ease;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-logo {
  width: 250px;
  max-width: none;
  height: auto;
  display: block;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.38));
  margin: 0 auto 18px;
  margin-bottom: -50px;
  margin-top: -70px;
}

.hero-title {
  font-size: 72px;
  font-weight: 900;
  color: white;
  margin: 0;
  line-height: 1;
  letter-spacing: -3px;
  text-shadow: 0 5px 25px rgba(0, 0, 0, 0.45);
  font-family: 'Manrope', Arial, sans-serif;
}

.hero-subtitle {
  font-size: 30px;
  color: rgba(255,255,255,.88);
  margin: 0 0 26px;
  font-weight: 600;
  margin-bottom: 40px;
  margin-top: 12px;
  text-shadow: 0 3px 15px rgba(0, 0, 0, 0.35);
}

.popular {
  justify-content: center;
  margin: 28px 0 30px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 30px 0 40px;
  margin-top: 35px;
  margin-bottom: 35px;
}

.stats div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats strong {
  font-size: 42px;
  color: white;
  font-weight: 900;
}

.stats span {
  color: rgba(225,225,225,.75);
  font-size: 14px;
}

.hero-question {
  font-size: 32px;
  font-weight: 800;
  margin: 50px 0 25px;
  color: white;
}

.destinations {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  max-width: 760px;
  margin: 28px auto 34px;
}

.destination-card {
  position: relative;
  height: 105px;
  border-radius: 22px;
  padding: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  color: white;
  border: 1px solid rgba(255,255,255,.24);
  box-shadow: 0 18px 45px rgba(0,0,0,.22);
  transition: .25s;
}

.destination-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.62));
  z-index: 1;
}

.destination-card span,
.destination-card strong {
  position: relative;
  z-index: 2;
}

.destination-card span {
  font-size: 24px;
  margin-bottom: 6px;
}

.destination-card strong {
  font-size: 18px;
}

.destination-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 25px 65px rgba(0,0,0,.32);
}

.altai {
  background: linear-gradient(135deg, #0f766e, #38bdf8);
}

.baikal {
  background: linear-gradient(135deg, #075985, #0ea5e9);
}

.karelia {
  background: linear-gradient(135deg, #14532d, #22c55e);
}

.kamchatka {
  background: linear-gradient(135deg, #7f1d1d, #f97316);
}

.dagestan {
  background: linear-gradient(135deg, #78350f, #f59e0b);
}

.sochi {
  background: linear-gradient(135deg, #064e3b, #06b6d4);
}

@media (max-width: 700px) {
  .destinations {
    grid-template-columns: repeat(2, 1fr);
  }

  .destination-card {
    height: 95px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: .4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: .5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.close-btn,
.back-btn {
  position: absolute;
  top: 22px;
  right: 22px;

  width: 42px;
  height: 42px;
  padding: 0;
  margin: 0;

  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.12);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  box-shadow: none;
}

.result-image {
  width: 100%;
  height: 220px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 25px;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit:cover;
  object-position: center;
}

.route-header-image {
  min-height: 260px;
  padding: 28px;
  border-radius: 26px;
  background-size: cover;
  background-position: center;
  margin-bottom: 28px;
  transition: background-image .4s ease, opacity .4s ease;
}

.route-header,
.route-header-image {
  width: 100%;
  min-height: 240px;
  border-radius: 24px;
  background-size: cover;
  background-position: center;
}

.route-header.route-header-image {
  align-items: flex-end;
}

.planner-card h2,
.route-header h2,
.hero-question {
  font-family: 'Manrope', Arial, sans-serif;
  font-weight: 800;
}

.route-gallery-dots {
  display: flex;
  gap: 8px;
  margin: -16px 0 28px;
  position: relative;
  z-index: 20;
}

.gallery-line {
  flex: 1;
  height: 5px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 999px;
  background: rgba(255,255,255,.22);
  cursor: pointer;
  overflow: hidden;
}

.gallery-line.active {
  background: linear-gradient(90deg, #38bdf8, #0ea5e9);
  box-shadow: 0 0 18px rgba(56,189,248,.45);
}

.saved-routes {
  max-width: 1180px;
  margin: 50px auto;
}

.saved-routes h2 {
  color: white;
  margin-bottom: 18px;
}

.saved-route-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 16px 20px;
  margin-bottom: 12px;

  border-radius: 16px;

  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);

  cursor: pointer;
}

.saved-route-card:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,.18);
}

.saved-route-card span {
  opacity: .85;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
}

.delete-route-btn {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
  color: white;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.pdf-btn {
  margin-top: 20px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    #2563eb,
    #06b6d4
  );
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.mode-switch {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
  position: relative;
  z-index: 20;
}

.mode-btn {
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.12);
  color: white;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
}

.mode-btn.active {
  background: linear-gradient(90deg, #2563eb, #06b6d4);
}

.destination-card {
  padding: 16px 20px;
  min-height: 70px;
}

.history-card,
.memory-card {
  margin-top: 24px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  backdrop-filter: blur(12px);
}

.history-card h3,
.memory-card h3 {
  margin-bottom: 12px;
  color: #66d9ff;
}

.history-card p,
.memory-card li {
  color: #fff;
  line-height: 1.7;
}

.memory-card ul {
  margin: 0;
  padding-left: 20px;
}

.duration-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.duration-btn {
  margin: 0;
  padding: 16px 14px;
  border-radius: 18px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.22);
  color: white;
  font-weight: 800;
}

.duration-btn span {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  opacity: .8;
}

.duration-btn.active {
  background: linear-gradient(90deg, #2563eb, #06b6d4);
}

.city-picker {
  width: 100%;
  margin-top: 16px;
}

.city-group {
  margin-bottom: 18px;
  text-align: left;
}

.city-group h3 {
  margin: 0 0 10px;
  font-size: 15px;
  color: rgba(255,255,255,.85);
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.city-btn {
  margin: 0;
  padding: 13px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.22);
  color: white;
  font-size: 14px;
  font-weight: 800;
}

.city-btn.active {
  background: linear-gradient(90deg, #2563eb, #06b6d4);
  box-shadow: 0 12px 28px rgba(37,99,235,.32);
}

.ready-route-info {
  max-width: 760px;
  margin: 18px auto 0;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  backdrop-filter: blur(18px);
  text-align: left;
}

.ready-route-info h3 {
  margin: 0 0 10px;
  color: white;
  font-size: 22px;
}

.ready-route-info p {
  margin: 0 0 16px;
  color: rgba(255,255,255,.86);
  line-height: 1.6;
}

.ready-route-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ready-route-points span {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.18);
  font-size: 13px;
  font-weight: 700;
}

.ready-route-btn {
  max-width: 430px;
  margin: 18px auto 0;
  display: block;
}

.ready-routes-grid {
  width: min(100%, 980px);
  margin: 28px auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.ready-route-card {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(18px);
  text-align: left;
  display: flex;
  flex-direction: column;
}

.ready-route-duration {
  display: inline-flex;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 800;
}

.ready-route-card h3 {
  margin: 18px 0 10px;
  color: white;
  font-size: 21px;
  line-height: 1.25;
}

.ready-route-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
  font-size: 14px;
  flex-grow: 1;
}

.ready-route-card button {
  margin-top: 20px;
  padding: 13px;
  font-size: 14px;
}

@media (max-width: 850px) {
  .ready-routes-grid {
    grid-template-columns: 1fr;
  }
}

.map-travel-switch {
  width: min(100%, 1180px);
  margin: 30px auto 14px;
  padding: 8px;
  display: flex;
  gap: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(18px);
}

.map-travel-btn {
  margin: 0;
  padding: 13px 18px;
  background: transparent;
  box-shadow: none;
  font-size: 15px;
}

.map-travel-btn:hover {
  box-shadow: none;
}

.map-travel-btn.active {
  background: linear-gradient(90deg, #2563eb, #06b6d4);
}

.route-stops-section {
  width: min(100%, 1180px);
  margin: 34px auto 0;
  padding: 28px;
  border-radius: 28px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.17);
  backdrop-filter: blur(22px);
}

.route-stops-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 22px;
}

.route-stops-heading span {
  color: #7dd3fc;
  font-weight: 800;
}

.route-stops-heading h2 {
  margin: 5px 0 0;
  font-size: 30px;
}

.route-stops-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.route-stop-card {
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255,255,255,.09);
  border: 1px solid rgba(255,255,255,.15);
  cursor: pointer;
  transition: .2s;
}

.route-stop-card:hover {
  transform: translateY(-3px);
  background: rgba(255,255,255,.15);
}

.route-stop-card.completed {
  border-color: rgba(34,197,94,.65);
  background: rgba(34,197,94,.12);
}

.route-stop-number {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
}

.route-stop-card h3 {
  margin: 0 0 7px;
  color: white;
}

.route-stop-card p {
  margin: 0;
  color: rgba(255,255,255,.75);
  line-height: 1.5;
  font-size: 14px;
}

.stop-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3,9,22,.78);
  backdrop-filter: blur(12px);
}

.stop-modal {
  width: min(100%, 620px);
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
  border-radius: 28px;
  position: relative;
  background: linear-gradient(
    145deg,
    rgba(13,38,78,.98),
    rgba(5,20,47,.98)
  );
  border: 1px solid rgba(255,255,255,.2);
  box-shadow: 0 30px 100px rgba(0,0,0,.5);
}

.stop-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
}

.stop-modal-label {
  color: #7dd3fc;
  font-weight: 800;
}

.stop-modal h2 {
  margin: 8px 50px 24px 0;
  font-size: 32px;
}

.stop-modal-block {
  margin-top: 16px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255,255,255,.08);
}

.stop-modal-block h3 {
  margin: 0 0 10px;
}

.stop-modal-block p {
  margin: 0;
  line-height: 1.65;
  color: rgba(255,255,255,.86);
}

.audio-guide-btn,
.visit-stop-btn {
  margin-top: 16px;
}

.stop-completed-message {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  background: rgba(34,197,94,.18);
  border: 1px solid rgba(34,197,94,.55);
  color: #86efac;
  font-weight: 900;
}

@media (max-width: 700px) {
  .route-stops-grid {
    grid-template-columns: 1fr;
  }

  .route-stops-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .stop-modal {
    padding: 24px;
  }
}

.route-progress-card {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 22px;
  align-items: center;
  margin-bottom: 22px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.22),
    rgba(6, 182, 212, 0.12)
  );
  border: 1px solid rgba(125, 211, 252, 0.25);
}

.route-progress-label {
  color: #7dd3fc;
  font-weight: 900;
  font-size: 14px;
}

.route-progress-card h2 {
  margin: 8px 0 10px;
  font-size: 30px;
  color: white;
}

.route-progress-card p {
  margin: 0;
  color: rgba(255,255,255,.78);
  line-height: 1.6;
}

.start-route-btn {
  margin: 0;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(90deg, #facc15, #f97316);
  color: #111827;
  font-weight: 900;
}

.route-progress-line-wrap {
  margin-bottom: 24px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.14);
}

.route-progress-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 800;
}

.route-progress-top strong {
  color: #7dd3fc;
}

.route-progress-line {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.14);
  overflow: hidden;
}

.route-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e, #06b6d4);
  transition: width .3s ease;
}

.route-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.route-feature-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,.09);
  border: 1px solid rgba(255,255,255,.15);
}

.route-feature-card strong {
  display: block;
  margin-bottom: 6px;
  color: white;
  font-size: 16px;
}

.route-feature-card span {
  color: rgba(255,255,255,.72);
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 850px) {
  .route-progress-card {
    grid-template-columns: 1fr;
  }

  .route-features-grid {
    grid-template-columns: 1fr;
  }
}
html,
body,
#__nuxt {
  margin: 0;
  min-height: 100%;
  background: #061327 !important;
}

body {
  font-family: 'Manrope', Arial, sans-serif;
  overflow-x: hidden;
}

.page {
  min-height: 100vh;
  padding: 28px;
  color: white;
  background:
    radial-gradient(
      circle at 80% 0%,
      rgba(37, 99, 235, 0.2),
      transparent 30%
    ),
    radial-gradient(
      circle at 10% 80%,
      rgba(6, 182, 212, 0.12),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #061327 0%,
      #071a35 48%,
      #08264b 100%
    ) !important;
}

.new-home {
  width: min(100%, 1240px);
  margin: 0 auto;
  padding-top: 10px;
}

.new-hero {
  min-height: 540px;
  padding: 42px;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) 390px;
  gap: 34px;
  align-items: center;
  border-radius: 34px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  background:
    radial-gradient(
      circle at 85% 20%,
      rgba(56, 189, 248, 0.28),
      transparent 28%
    ),
    radial-gradient(
      circle at 10% 100%,
      rgba(250, 204, 21, 0.12),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      rgba(9, 40, 86, 0.98),
      rgba(7, 78, 128, 0.92)
    );
  box-shadow: 0 32px 95px rgba(0, 14, 42, 0.36);
  overflow: hidden;
  position: relative;
}

.new-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 82px,
      rgba(255, 255, 255, 0.025) 83px
    );
  pointer-events: none;
}

.new-hero-content,
.new-hero-card {
  position: relative;
  z-index: 2;
}

.top-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.top-brand-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.25));
}

.top-brand strong,
.top-brand span {
  display: block;
}

.top-brand strong {
  font-size: 22px;
  font-weight: 900;
}

.top-brand span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 13px;
}

.hero-chip {
  display: inline-flex;
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.14);
  border: 1px solid rgba(250, 204, 21, 0.28);
  color: #fde68a;
  font-size: 12px;
  font-weight: 900;
}

.new-hero h1 {
  max-width: 760px;
  margin: 20px 0 18px;
  font-size: clamp(40px, 5vw, 68px);
  line-height: 1.03;
  letter-spacing: -0.055em;
  color: white;
}

.new-hero p {
  max-width: 720px;
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 17px;
  line-height: 1.72;
}

.hero-actions-row {
  margin-top: 31px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-main-btn,
.hero-secondary-btn,
.open-feature-route,
.ready-card-btn,
.section-small-btn {
  width: auto;
  margin: 0;
  border: none;
  cursor: pointer;
}

.hero-main-btn,
.hero-secondary-btn {
  min-height: 52px;
  padding: 0 22px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 900;
}

.hero-main-btn {
  color: #111827;
  background: linear-gradient(90deg, #facc15, #f97316);
}

.hero-secondary-btn {
  color: white;
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.08);
}

.hero-stats-row {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(3, minmax(130px, 1fr));
  gap: 12px;
  max-width: 700px;
}

.hero-stats-row div {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
}

.hero-stats-row strong,
.hero-stats-row span {
  display: block;
}

.hero-stats-row strong {
  color: #7dd3fc;
  font-size: 30px;
}

.hero-stats-row span {
  margin-top: 4px;
  color: rgba(255,255,255,.66);
  font-size: 12px;
}

.new-hero-card {
  width: 100%;
  max-width: 390px;
  justify-self: end;
  padding: 26px;
  border-radius: 27px;
  background: rgba(5, 20, 49, 0.84);
  border: 1px solid rgba(255,255,255,.16);
  backdrop-filter: blur(18px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
}

.new-hero-card-label {
color: #7dd3fc;
  font-size: 12px;
  font-weight: 900;
}

.new-hero-card h2 {
  margin: 10px 0 12px;
  font-size: 26px;
  line-height: 1.25;
  color: white;
}

.new-hero-card p {
  color: rgba(255,255,255,.68);
  font-size: 14px;
  line-height: 1.6;
}

.new-route-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 18px 0 20px;
}

.new-route-tags span {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255,255,255,.09);
  color: rgba(255,255,255,.82);
  font-size: 12px;
  font-weight: 800;
}

.open-feature-route {
  width: 100%;
  min-height: 50px;
  border-radius: 15px;
  color: white;
  background: linear-gradient(90deg, #2563eb, #06b6d4);
  font-size: 14px;
  font-weight: 900;
}

.new-directions {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.new-direction-card {
  min-height: 190px;
  padding: 26px;
  display: flex;
  gap: 18px;
  border-radius: 28px;
  color: white;
  border: 1px solid rgba(255,255,255,.12);
  background:
    radial-gradient(
      circle at 90% 16%,
      rgba(250, 204, 21, 0.14),
      transparent 26%
    ),
    linear-gradient(145deg, #113c7c, #071d42);
  box-shadow: 0 22px 55px rgba(0, 13, 40, 0.22);
  cursor: pointer;
  transition: 0.24s;
}

.new-direction-card.art {
  background:
    radial-gradient(
      circle at 90% 16%,
      rgba(236, 72, 153, 0.18),
      transparent 26%
    ),
    linear-gradient(145deg, #4c2f91, #071d42);
}

.new-direction-card:hover,
.new-ready-card:hover {
  transform: translateY(-5px);
  border-color: rgba(125, 211, 252, 0.3);
}

.new-direction-icon {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255,255,255,.1);
  font-size: 26px;
}

.new-direction-card span {
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.new-direction-card h3 {
  margin: 8px 0 8px;
  color: white;
  font-size: 25px;
}

.new-direction-card p {
  color: rgba(255,255,255,.7);
  font-size: 14px;
}

.new-ready-section {
  margin-top: 34px;
}

.section-head {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
}

.section-head span {
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.section-head h2 {
  margin: 7px 0 0;
  color: white;
  font-size: 32px;
}

.section-small-btn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  color: #111827;
  background: linear-gradient(90deg, #facc15, #f97316);
  font-weight: 900;
}

.new-ready-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.new-ready-card {
  padding: 24px;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,.12);
  background:
    linear-gradient(
      145deg,
      rgba(18, 50, 97, 0.88),
      rgba(9, 31, 66, 0.96)
    );
  box-shadow: 0 22px 55px rgba(0, 13, 40, 0.22);
  transition: 0.24s;
  position: relative;
  overflow: hidden;
}

.new-ready-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 7px;
}

.ready-short::before {
  background: #0ea5e9;
}

.ready-day::before {
  background: #dc2626;
}

.ready-long::before {
  background: #f59e0b;
}

.ready-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ready-card-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255,255,255,.1);
  font-size: 25px;
}

.ready-card-duration {
  padding: 8px 11px;
  border-radius: 999px;
  color: #111827;
  background: #fde68a;
  font-size: 12px;
  font-weight: 900;
}

.new-ready-card h3 {
  margin: 24px 0 12px;
  color: white;
  font-size: 24px;
  line-height: 1.25;
}

.new-ready-card p {
  margin: 0;
  color: rgba(255,255,255,.68);
  line-height: 1.65;
  font-size: 14px;
}

.ready-card-meta {
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ready-card-meta span {
  padding: 7px 9px;
  border-radius: 9px;
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.76);
  font-size: 11px;
  font-weight: 800;
}

.ready-card-btn {
  margin-top: auto;
  min-height: 48px;
  border-radius: 15px;
  color: white;
  background: linear-gradient(90deg, #2563eb, #06b6d4);
  font-weight: 900;
}

.new-planner-card {
  width: min(100%, 880px);
  margin-top: 34px;
  background:
    linear-gradient(
      145deg,
      rgba(18, 50, 97, 0.92),
      rgba(9, 31, 66, 0.98)
    );
  border: 1px solid rgba(125, 211, 252, 0.16);
}

@media (max-width: 1050px) {
  .new-hero {
    grid-template-columns: 1fr;
  }

  .new-hero-card {
    justify-self: start;
  }

  .new-ready-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page {
    padding: 16px;
  }

  .new-hero {
    min-height: auto;
    padding: 28px 22px;
  }

  .top-brand {
    margin-bottom: 22px;
  }

  .new-hero h1 {
    font-size: 40px;
    letter-spacing: -0.035em;
  }

  .hero-stats-row,
  .new-directions {
    grid-template-columns: 1fr;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
.result-wrap {
  width: min(100%, 1240px);
  margin: 42px auto 0;
  padding: 28px;
  border-radius: 34px;
  background:
    linear-gradient(
      145deg,
      rgba(18, 50, 97, 0.9),
      rgba(9, 31, 66, 0.98)
    );
  border: 1px solid rgba(125, 211, 252, 0.16);
  box-shadow: 0 28px 80px rgba(0, 14, 42, 0.34);
  color: white;
}

.route-header-image {
  min-height: 300px;
  padding: 32px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.12);
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 -120px 120px rgba(0,0,0,.34);
}

.route-header.route-header-image {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.route-label {
  margin: 0 0 10px;
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.route-header h2 {
  margin: 0;
  color: white;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.route-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.route-stats span {
  padding: 10px 13px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.14);
  color: rgba(255,255,255,.86);
  font-size: 13px;
  font-weight: 800;
}

.history-card,
.memory-card {
  margin-top: 20px;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255,255,255,.075);
  border: 1px solid rgba(255,255,255,.12);
}

.history-card h3,
.memory-card h3 {
  margin: 0 0 12px;
  color: #7dd3fc;
  font-size: 20px;
}

.history-card p,
.memory-card li {
  color: rgba(255,255,255,.82);
  line-height: 1.7;
}

.memory-card ul {
  margin: 0;
  padding-left: 20px;
}

.result {
  margin-top: 22px;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.86);
  font-size: 16px;
  line-height: 1.75;
}

.result h3 {
  margin: 22px 0 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: white;
  font-size: 22px;
  line-height: 1.25;
}

.pdf-btn {
  width: 100%;
  margin-top: 22px;
  min-height: 54px;
  border-radius: 18px;
  background: linear-gradient(90deg, #2563eb, #06b6d4);
  color: white;
  font-size: 15px;
  font-weight: 900;
}

.map-card {
  width: min(100%, 1240px);
  max-width: 1240px;
  margin: 34px auto 0;
  padding: 28px;
  border-radius: 34px;
  background:
    linear-gradient(
      145deg,
      rgba(18, 50, 97, 0.9),
      rgba(9, 31, 66, 0.98)
    );
  border: 1px solid rgba(125, 211, 252, 0.16);
  box-shadow: 0 28px 80px rgba(0, 14, 42, 0.34);
  color: white;
}

.map-card h2 {
  margin: 0 0 20px;
  color: white;
  font-size: 30px;
  letter-spacing: -0.03em;
}

.yandex-map {
  height: 460px !important;
  min-height: 460px !important;
  border-radius: 26px !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  overflow: hidden !important;
  background: rgba(255,255,255,.08) !important;
}

@media (max-width: 760px) {
  .result-wrap,
  .map-card {
    padding: 18px;
    border-radius: 26px;
  }

  .route-header.route-header-image {
    min-height: 260px;
    padding: 22px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .route-stats {
    justify-content: flex-start;
  }

  .yandex-map {
    height: 360px !important;
    min-height: 360px !important;
  }
}
.site-sidebar {
  position: fixed;
  top: 24px;
  left: 24px;
  bottom: 24px;
  z-index: 100;
  width: 280px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  border-radius: 30px;
  background:
    linear-gradient(
      180deg,
      rgba(7, 28, 64, 0.96),
      rgba(4, 17, 40, 0.98)
    );
  border: 1px solid rgba(125, 211, 252, 0.16);
  box-shadow: 0 28px 90px rgba(0, 14, 42, 0.42);
  backdrop-filter: blur(22px);
}

.side-brand {
  width: 100%;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  color: white;
  text-align: left;
  box-shadow: none;
}

.side-brand:hover {
  transform: none;
  box-shadow: none;
}

.side-brand img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.side-brand strong,
.side-brand small {
  display: block;
}

.side-brand strong {
  font-size: 18px;
  line-height: 1.1;
}

.side-brand small {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.side-nav-btn {
  width: 100%;
  min-height: 50px;
  margin: 0;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid transparent;
  box-shadow: none;
  font-size: 14px;
  font-weight: 800;
  text-align: left;
}

.side-nav-btn:hover {
  transform: translateX(3px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: none;
  color: white;
}

.side-nav-btn.active {
  color: white;
  background:
    linear-gradient(
      90deg,
      rgba(37, 99, 235, 0.42),
      rgba(6, 182, 212, 0.16)
    );
  border-color: rgba(125, 211, 252, 0.22);
}

.side-nav-btn span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.side-rvio-card {
  margin-top: auto;
  padding: 18px;
  border-radius: 22px;
  background:
    radial-gradient(
      circle at 88% 18%,
      rgba(250, 204, 21, 0.2),
      transparent 30%
    ),
    linear-gradient(
      145deg,
      rgba(37, 99, 235, 0.34),
      rgba(7, 30, 70, 0.86)
    );
  border: 1px solid rgba(250, 204, 21, 0.18);
}

.side-rvio-card span {
  color: #fde68a;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.side-rvio-card strong {
  display: block;
  margin: 8px 0 14px;
  color: white;
  font-size: 14px;
  line-height: 1.35;
}

.side-rvio-card button {
  width: 100%;
  min-height: 42px;
  margin: 0;
  padding: 0 14px;
  border-radius: 13px;
  color: #111827;
  background: linear-gradient(90deg, #facc15, #f97316);
  font-size: 12px;
  font-weight: 900;
}

.side-user-card {
  width: 100%;
  margin: 14px 0 0;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-align: left;
  box-shadow: none;
}

.side-user-card:hover {
  transform: translateY(-2px);
  box-shadow: none;
  background: rgba(255, 255, 255, 0.11);
}

.side-user-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #111827;
  background: linear-gradient(135deg, #facc15, #f97316);
  font-size: 13px;
  font-weight: 900;
}

.side-user-card strong,
.side-user-card span {
  display: block;
}

.side-user-card strong {
  font-size: 14px;
}

.side-user-card span {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
}

.profile-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  justify-content: flex-end;
  background: rgba(2, 8, 23, 0.64);
  backdrop-filter: blur(10px);
}

.profile-drawer {
  width: min(100%, 460px);
  height: 100vh;
  padding: 28px;
  overflow-y: auto;
  background:
    linear-gradient(
      180deg,
      rgba(8, 31, 70, 0.98),
      rgba(4, 17, 40, 0.99)
    );
    border-left: 1px solid rgba(125, 211, 252, 0.16);
  box-shadow: -28px 0 90px rgba(0, 14, 42, 0.5);
  color: white;
}

.profile-drawer-close {
  width: 42px;
  height: 42px;
  margin: 0 0 22px auto;
  padding: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.09);
  color: white;
  box-shadow: none;
  font-size: 26px;
}

.profile-drawer-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-drawer-avatar {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  color: #111827;
  background: linear-gradient(135deg, #facc15, #f97316);
  font-size: 22px;
  font-weight: 900;
}

.profile-drawer-head span,
.profile-task-preview span {
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.profile-drawer-head h2 {
  margin: 6px 0 4px;
  font-size: 28px;
}

.profile-drawer-head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

.profile-level-card {
  margin-top: 26px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-level-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
  font-size: 13px;
}

.profile-level-top span {
  color: rgba(255, 255, 255, 0.6);
}

.profile-level-line {
  height: 11px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.profile-level-line div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #22c55e, #06b6d4);
}

.profile-mini-stats {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.profile-mini-stats article {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-mini-stats strong {
  display: block;
  color: #7dd3fc;
  font-size: 28px;
}

.profile-mini-stats span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
}

.profile-task-preview {
  margin-top: 16px;
  padding: 20px;
  border-radius: 22px;
  background:
    linear-gradient(
      145deg,
      rgba(18, 50, 97, 0.9),
      rgba(9, 31, 66, 0.98)
    );
  border: 1px solid rgba(125, 211, 252, 0.12);
}

.profile-task-preview h3 {
  margin: 8px 0 10px;
  font-size: 20px;
}

.profile-task-preview p {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  line-height: 1.6;
  font-size: 13px;
}

.task-reward {
  margin-top: 14px;
  display: inline-flex;
  padding: 8px 11px;
  border-radius: 999px;
  color: #111827;
  background: #fde68a;
  font-size: 12px;
  font-weight: 900;
}

@media (min-width: 1101px) {
  .page {
    padding-left: 328px;
  }
}

@media (max-width: 1100px) {
  .site-sidebar {
    left: 16px;
    right: 16px;
    top: auto;
    bottom: 16px;
    width: auto;
    height: 74px;
    padding: 8px;
    flex-direction: row;
    align-items: center;
    border-radius: 24px;
  }

  .side-brand,
  .side-rvio-card,
  .side-user-card {
    display: none;
  }

  .side-nav {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    gap: 6px;
  }

  .side-nav-btn {
    min-height: 56px;
    padding: 0;
    justify-content: center;
    font-size: 0;
  }

  .side-nav-btn span {
    width: 42px;
    height: 42px;
    font-size: 18px;
  }

  .side-nav-btn:nth-child(4) {
    display: none;
  }

  .profile-drawer {
    width: 100%;
  }
}
.welcome-screen {
  min-height: calc(100vh - 56px);
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 46px;
  position: relative;
  overflow: hidden;
  border-radius: 38px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  background:
    radial-gradient(
      circle at 78% 18%,
      rgba(56, 189, 248, 0.24),
      transparent 30%
    ),
    radial-gradient(
      circle at 8% 100%,
      rgba(250, 204, 21, 0.13),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      rgba(8, 31, 70, 0.98),
      rgba(7, 78, 128, 0.92)
    );
  box-shadow: 0 34px 110px rgba(0, 14, 42, 0.42);
}

.welcome-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 82px,
      rgba(255, 255, 255, 0.026) 83px
    );
  pointer-events: none;
}

.welcome-content {
  position: relative;
  z-index: 2;
  width: min(100%, 740px);
}

.welcome-preview-card {
  position: relative;
  z-index: 2;
  flex: 0 0 380px;
  transform: translateY(-10px);
}

.welcome-logo-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.welcome-logo-row img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  filter: drop-shadow(0 16px 32px rgba(0, 0, 0, 0.28));
}

.welcome-logo-row strong,
.welcome-logo-row span {
  display: block;
}

.welcome-logo-row strong {
  color: white;
  font-size: 25px;
  font-weight: 900;
  line-height: 1.1;
}

.welcome-logo-row span {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.64);
  font-size: 13px;
}

.welcome-chip {
  display: inline-flex;
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.14);
  border: 1px solid rgba(250, 204, 21, 0.28);
  color: #fde68a;
  font-size: 12px;
  font-weight: 900;
}

.welcome-content h1 {
  max-width: 760px;
  margin: 22px 0 18px;
  color: white;
  font-size: clamp(50px, 6vw, 82px);
  line-height: 1.02;
  letter-spacing: -0.06em;
}

.welcome-content p {
  max-width: 720px;
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 18px;
  line-height: 1.72;
}

.welcome-actions {
  margin-top: 34px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.welcome-main-btn,
.welcome-route-btn {
  width: auto;
  min-height: 56px;
  margin: 0;
  padding: 0 24px;
  border-radius: 17px;
  font-size: 15px;
  font-weight: 900;
}

.welcome-main-btn {
  color: #111827;
  background: linear-gradient(90deg, #facc15, #f97316);
}

.welcome-route-btn {
  color: white;
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(255,255,255,.08);
}

.welcome-features {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 720px;
}

.welcome-features article {
  padding: 17px;
  border-radius: 18px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
}

.welcome-features strong,
.welcome-features span {
  display: block;
}

.welcome-features strong {
  color: #7dd3fc;
  font-size: 30px;
}

.welcome-features span {
  margin-top: 5px;
  color: rgba(255,255,255,.66);
  font-size: 12px;
}

.welcome-preview-card {
  padding: 28px;
  border-radius: 30px;
  background: rgba(5, 20, 49, 0.84);
  border: 1px solid rgba(255,255,255,.16);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.32);
}

.welcome-preview-card > span {
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.welcome-preview-card h2 {
  margin: 12px 0;
  color: white;
  font-size: 28px;
  line-height: 1.22;
}

.welcome-preview-card p {
  margin: 0;
  color: rgba(255,255,255,.68);
  line-height: 1.65;
  font-size: 14px;
}

.welcome-preview-card div {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.welcome-preview-card small {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255,255,255,.09);
  color: rgba(255,255,255,.82);
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1050px) {
  .welcome-screen {
    align-items: flex-start;
    flex-direction: column;
  }

  .welcome-preview-card {
    flex: none;
    width: min(100%, 520px);
  }
}

@media (max-width: 760px) {
  .welcome-screen {
    min-height: auto;
    padding: 28px 22px;
    border-radius: 30px;
  }

  .welcome-content h1 {
    font-size: 42px;
    letter-spacing: -0.04em;
  }

  .welcome-features {
    grid-template-columns: 1fr;
  }
}

  .welcome-content h1 {
    font-size: 42px;
    letter-spacing: -0.04em;
  }

  .welcome-features {
    grid-template-columns: 1fr;
  }
.welcome-screen .welcome-features {
  margin-top: 34px !important;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 12px !important;
  max-width: 760px !important;
}

.welcome-screen .welcome-features article {
  min-height: 96px;
  padding: 18px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  border-radius: 18px !important;
  background: rgba(255,255,255,.08) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
}

.welcome-screen .welcome-features strong {
  display: block !important;
  color: #7dd3fc !important;
  font-size: 30px !important;
  line-height: 1 !important;
}

.welcome-screen .welcome-features span {
  display: block !important;
  margin-top: 7px !important;
  color: rgba(255,255,255,.66) !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
}

@media (max-width: 760px) {
  .welcome-screen .welcome-features {
    grid-template-columns: 1fr !important;
  }
}
</style>