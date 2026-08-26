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

  const routePhotos = {
    redSquare:
      'https://images.unsplash.com/photo-1661973428766-a2c31ef04102?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    vdnh:
      'https://images.unsplash.com/photo-1636734048938-a28eeaf914e8?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    space:
      'https://images.unsplash.com/photo-1718747696639-5f1efb9ea0f0?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    metro:
      'https://images.unsplash.com/photo-1642709153647-417788a4210a?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    region:
      'https://images.unsplash.com/photo-1595891058805-7c07e70946de?auto=format&fit=crop&fm=jpg&q=82&w=2200'
  }

  const historicalMoscowGallery = [
    'https://images.unsplash.com/photo-1661973428766-a2c31ef04102?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?auto=format&fit=crop&fm=jpg&q=82&w=2200'
  ]

  const artMoscowGallery = [
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&fm=jpg&q=82&w=2200',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&fm=jpg&q=82&w=2200'
  ]

  const readyRouteGalleries = {
    'kremlin-origins': [
      'https://images.unsplash.com/photo-1661973428766-a2c31ef04102?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'romanov-moscow': [
      'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'peter-moscow': [
      'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'moscow-1812': [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'imperial-moscow': [
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'revolutionary-moscow': [
      'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    avantgarde: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&fm=jpg&q=82&w=2200&sat=-20',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'soviet-moscow': [
      'https://images.unsplash.com/photo-1636734048938-a28eeaf914e8?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1595891058805-7c07e70946de?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1642709153647-417788a4210a?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'war-memory': [
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    'space-moscow': [
      'https://images.unsplash.com/photo-1718747696639-5f1efb9ea0f0?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1636734048938-a28eeaf914e8?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ],
    grand: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&fm=jpg&q=82&w=2200',
      'https://images.unsplash.com/photo-1595891058805-7c07e70946de?auto=format&fit=crop&fm=jpg&q=82&w=2200'
    ]
  }

  const pdfLoading = ref(false)

  const formattedResult = computed(() => {
    const text = typeof result.value === 'string'
      ? result.value
      : JSON.stringify(result.value, null, 2)

    return text
      .replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>')
      .replace(/\n/g, '<br>')
  })

  const routeDurationName = computed(() => {
    if (currentReadyRouteId.value) {
      const currentRoute = readyMoscowRoutes.find(
        (item) => item.id === currentReadyRouteId.value
      )

      if (currentRoute?.variantLabel) {
        return currentRoute.variantLabel
      }
    }

    if (routeDuration.value === 'short') return 'Короткий'
    if (routeDuration.value === 'day') return 'На день'
    if (routeDuration.value === 'long') return 'Несколько дней'
    return '—'
  })

  const currentReadyRoute = computed(() => {
    if (!currentReadyRouteId.value) return null

    return readyMoscowRoutes.find(
      (item) => item.id === currentReadyRouteId.value
    ) || null
  })

  const currentDestinationImage = computed(() => {
    if (place.value === 'Москва') {
      return routePhotos.redSquare
    }

    return destinationImages[place.value] || routePhotos.redSquare
  })

  const currentGallery = computed(() => {
    const readyRoute = currentReadyRoute.value

    if (readyRoute) {
      if (readyRoute.catalogType === 'grand') {
        return readyRouteGalleries.grand
      }

      return (
        readyRouteGalleries[readyRoute.themeId] ||
        historicalMoscowGallery
      )
    }

    if (place.value === 'Москва') {
      return routeMode.value === 'moscowArt'
        ? artMoscowGallery
        : historicalMoscowGallery
    }

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

  function resetCurrentRoute() {
    result.value = ''
    mapPoints.value = []
    routeStops.value = []
    activeStop.value = null
    currentReadyRouteId.value = ''
    history.value = ''
    memoryPlaces.value = []
    routeTitle.value = ''
    routeAbout.value = ''
    pleinairs.value = []
    equipment.value = []
    routeSummary.value = ''
    mapTravelMode.value = 'pedestrian'
    activeImageIndex.value = 0
  }

  function switchRouteMode(mode) {
    if (routeMode.value !== mode || result.value) {
      resetCurrentRoute()
    }

    routeMode.value = mode
  }

  function closePlanner() {
    showPlanner.value = false
    resetCurrentRoute()
    days.value = ''
    budget.value = ''
  }

  function selectDestination(name) {
    resetCurrentRoute()
    place.value = name
    showPlanner.value = true
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
    place.value = route.place || 'Москва'
    days.value = route.days
    mapTravelMode.value =
      route.travelMode || 'pedestrian'
    budget.value = ''
    activeImageIndex.value = 0

    currentReadyRouteId.value = route.id
    activeStop.value = null

    routeTitle.value = route.title
    routeAbout.value =
      route.about ||
      `${route.preview} За ${route.duration} вы пройдёте ${route.mapPoints.length} исторических точек, услышите аудиогид и сможете выполнить небольшие задания по ходу путешествия.`
    history.value = route.history
    memoryPlaces.value = [...route.memoryPlaces]

    pleinairs.value = []
    equipment.value = []
    routeSummary.value = ''

    routeStops.value = route.mapPoints.map((point, index) => {
      const fallback =
        moscowStopContent[point.name] || {
          description:
            'Историческая точка, включённая в тематический маршрут по Москве.',
          task:
            'Осмотрите объект и отметьте деталь, которая лучше всего передаёт характер эпохи.'
        }

      const description =
        point.description ||
        fallback.description

      const task =
        point.task ||
        fallback.task

      return {
        ...point,
        id: `${route.id}-${index}`,
        number: index + 1,
        description,
        task,
        audio:
          point.audio ||
          fallback.audio ||
          `${point.name}. ${description} Это одна из точек исторического маршрута «${route.title}». Осмотрите объект внимательно и выполните задание: ${task}`
      }
    })

    mapPoints.value = routeStops.value.map((stop) => ({
      ...stop,
      coords:
        Array.isArray(stop.coords)
          ? [...stop.coords]
          : undefined
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
    const activeMode = routeMode.value
    resetCurrentRoute()
    routeMode.value = activeMode

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
      mapTravelMode: mapTravelMode.value,
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
    mapTravelMode.value =
      route.mapTravelMode || 'pedestrian'

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

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function pdfFileName() {
    const base =
      routeTitle.value ||
      place.value ||
      'маршрут'

    return `Открой-Россию-${base}`
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '.pdf'
  }

  async function downloadPdf() {
    if (typeof window === 'undefined' || pdfLoading.value) {
      return
    }

    pdfLoading.value = true

    let pdfRoot = null

    try {
      const module = await import('html2pdf.js')
      const html2pdf = module.default || module

      const title =
        routeTitle.value ||
        (routeMode.value === 'moscowArt'
          ? `Москва в красках: ${place.value || 'Москва'}`
          : `Маршрут: ${place.value || 'Россия'}`)

      const description =
        routeAbout.value ||
        history.value ||
        routeSummary.value ||
        'Маршрут создан на платформе «Открой Россию».'

      const points =
        routeStops.value.length
          ? routeStops.value
          : mapPoints.value.map((point, index) => ({
              ...point,
              number: index + 1,
              name:
                typeof point === 'string'
                  ? point
                  : point?.name || `Точка ${index + 1}`,
              description:
                typeof point === 'object'
                  ? point?.description || ''
                  : '',
              task:
                typeof point === 'object'
                  ? point?.task || ''
                  : ''
            }))

      const transport =
        mapTravelMode.value === 'auto'
          ? 'Автомобильный'
          : 'Пеший'

      const dayCount = Math.max(1, Number(days.value) || 1)

      const pointsHtml = points.length
        ? points
            .map((point, index) => `
              <article class="pdf-stop-card">
                <div class="pdf-stop-number">${index + 1}</div>
                <div>
                  <div class="pdf-stop-topline">
                    ${point.day ? `<span>День ${escapeHtml(point.day)}</span>` : ''}
                  </div>
                  <h3>${escapeHtml(point.name)}</h3>
                  ${point.description ? `<p>${escapeHtml(point.description)}</p>` : ''}
                  ${point.task ? `<div class="pdf-task"><strong>Задание:</strong> ${escapeHtml(point.task)}</div>` : ''}
                </div>
              </article>
            `)
            .join('')
        : '<p class="pdf-empty">Точки маршрута будут доступны после генерации.</p>'

      const artHtml = pleinairs.value.length
        ? `
          <section class="pdf-section">
            <h2>Творческие остановки</h2>
            ${pleinairs.value.map((item, index) => `
              <article class="pdf-stop-card">
                <div class="pdf-stop-number">${index + 1}</div>
                <div>
                  <h3>${escapeHtml(item.place || `Пленэр ${index + 1}`)}</h3>
                  <p>${escapeHtml(item.history || '')}</p>
                  ${item.skill ? `<div class="pdf-task"><strong>Навык:</strong> ${escapeHtml(item.skill)}</div>` : ''}
                </div>
              </article>
            `).join('')}
          </section>
        `
        : ''

      pdfRoot = document.createElement('div')
      pdfRoot.className = 'pdf-export-document'
      pdfRoot.innerHTML = `
        <div class="pdf-cover">
          <div class="pdf-brand">ОТКРОЙ РОССИЮ</div>
          <div class="pdf-eyebrow">Персональный маршрут</div>
          <h1>${escapeHtml(title)}</h1>
          <p class="pdf-lead">${escapeHtml(description)}</p>

          <div class="pdf-meta-grid">
            <div><span>Формат</span><strong>${escapeHtml(routeDurationName.value)}</strong></div>
            <div><span>Транспорт</span><strong>${escapeHtml(transport)}</strong></div>
            <div><span>Дней</span><strong>${dayCount}</strong></div>
            <div><span>Точек</span><strong>${points.length}</strong></div>
          </div>
        </div>

        ${history.value ? `
          <section class="pdf-section">
            <span class="pdf-section-label">О маршруте</span>
            <h2>Исторический контекст</h2>
            <p class="pdf-copy">${escapeHtml(history.value)}</p>
          </section>
        ` : ''}

        <section class="pdf-section">
          <span class="pdf-section-label">Маршрут</span>
          <h2>Точки путешествия</h2>
          <div class="pdf-stops">${pointsHtml}</div>
        </section>

        ${artHtml}

        <footer class="pdf-footer">
          <strong>Открой Россию</strong>
          <span>Путешествия начинаются здесь</span>
        </footer>
      `

      Object.assign(pdfRoot.style, {
        position: 'absolute',
        left: '-100000px',
        top: '0',
        width: '190mm',
        margin: '0 auto',
        background: '#ffffff',
        color: '#10213a',
        fontFamily: 'Arial, Segoe UI, sans-serif'
      })

      const style = document.createElement('style')
      style.textContent = `
        .pdf-export-document * { box-sizing: border-box; }
        .pdf-cover { padding: 20mm 16mm 16mm; border-radius: 0 0 8mm 8mm; color: #fff; background: linear-gradient(140deg, #08264b 0%, #0a4f7a 100%); }
        .pdf-brand { font-size: 11px; font-weight: 900; letter-spacing: .18em; color: #7dd3fc; }
        .pdf-eyebrow { margin-top: 22mm; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #fde68a; }
        .pdf-cover h1 { margin: 4mm 0 4mm; font-size: 30px; line-height: 1.08; color: #fff; }
        .pdf-lead { max-width: 155mm; margin: 0; font-size: 13px; line-height: 1.65; color: rgba(255,255,255,.82); }
        .pdf-meta-grid { margin-top: 10mm; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
        .pdf-meta-grid div { padding: 4mm; border-radius: 4mm; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.13); }
        .pdf-meta-grid span, .pdf-meta-grid strong { display: block; }
        .pdf-meta-grid span { font-size: 8px; color: rgba(255,255,255,.62); text-transform: uppercase; letter-spacing: .08em; }
        .pdf-meta-grid strong { margin-top: 1.5mm; font-size: 11px; color: #fff; }
        .pdf-section { padding: 12mm 16mm 0; }
        .pdf-section-label { color: #0284c7; font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
        .pdf-section h2 { margin: 2mm 0 4mm; color: #0b2f5b; font-size: 21px; }
        .pdf-copy { margin: 0; color: #334155; font-size: 11.5px; line-height: 1.72; }
        .pdf-stops { display: grid; gap: 4mm; }
        .pdf-stop-card { display: grid; grid-template-columns: 11mm 1fr; gap: 4mm; padding: 5mm; border: 1px solid #dbe7f3; border-radius: 4mm; background: #f8fbff; break-inside: avoid; page-break-inside: avoid; }
        .pdf-stop-number { width: 10mm; height: 10mm; border-radius: 50%; display: grid; place-items: center; color: #fff; background: #0ea5e9; font-size: 11px; font-weight: 900; }
        .pdf-stop-topline span { display: inline-block; margin-bottom: 1.5mm; padding: 1.2mm 2.5mm; border-radius: 99mm; background: #e0f2fe; color: #0369a1; font-size: 8px; font-weight: 800; }
        .pdf-stop-card h3 { margin: 0 0 2mm; color: #0f2747; font-size: 14px; }
        .pdf-stop-card p { margin: 0; color: #475569; font-size: 10.5px; line-height: 1.58; }
        .pdf-task { margin-top: 3mm; padding: 3mm; border-radius: 3mm; background: #fff7d6; color: #624a00; font-size: 10px; line-height: 1.5; }
        .pdf-empty { color: #64748b; }
        .pdf-footer { margin: 12mm 16mm 0; padding: 6mm 0 10mm; display: flex; justify-content: space-between; gap: 8mm; border-top: 1px solid #dbe7f3; color: #64748b; font-size: 9px; }
        .pdf-footer strong { color: #0b2f5b; }
      `

      pdfRoot.prepend(style)
      document.body.appendChild(pdfRoot)

      await html2pdf()
        .set({
          margin: [8, 8, 10, 8],
          filename: pdfFileName(),
          image: {
            type: 'jpeg',
            quality: 0.96
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
          },
          pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['.pdf-stop-card']
          }
        })
        .from(pdfRoot)
        .save()
    } catch (error) {
      console.error('[PDF] Не удалось сформировать PDF:', error)
    } finally {
      pdfRoot?.remove()
      pdfLoading.value = false
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
    pdfLoading,
    readyMoscowRoutes,
    openReadyMoscowRoute,
    resetCurrentRoute,
    switchRouteMode,
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
