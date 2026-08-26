<script setup>
import {
  computed,
  ref
} from 'vue'

const props = defineProps({
  routeMode: {
    type: String,
    required: true
  },

  showPlanner: {
    type: Boolean,
    required: true
  },

  readyRoutes: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'show-history',
  'show-planner',
  'show-art',
  'open-route'
])

const selectedDuration = ref('short')

const durationOptions = [
  {
    id: 'short',
    label: 'Короткий',
    hint: '2–3 часа'
  },
  {
    id: 'medium',
    label: 'Средний',
    hint: '4–5 часов'
  },
  {
    id: 'long',
    label: 'Длинный',
    hint: '7–9 часов'
  }
]

const routeThemes = computed(() => {
  const groups = new Map()

  props.readyRoutes.forEach((route) => {
    if (!route.themeId) return

    if (!groups.has(route.themeId)) {
      groups.set(route.themeId, {
        id: route.themeId,
        icon: route.themeIcon || '📍',
        epoch: route.epoch || '',
        title: route.themeTitle || route.title,
        routes: []
      })
    }

    groups.get(route.themeId).routes.push(route)
  })

  return Array.from(groups.values())
})

const visibleThemeCards = computed(() =>
  routeThemes.value
    .map((theme) => ({
      ...theme,
      route:
        theme.routes.find(
          (route) =>
            route.variantId === selectedDuration.value
        ) ||
        theme.routes[0]
    }))
    .filter((theme) => theme.route)
)

const grandRoute = computed(() =>
  props.readyRoutes.find(
    (route) => route.catalogType === 'grand'
  ) || null
)

const recommendedRoute = computed(() =>
  props.readyRoutes.find(
    (route) =>
      route.id === 'war-memory-short'
  ) ||
  props.readyRoutes[0] ||
  null
)

const uniqueHistoricalPoints = computed(() => {
  const points = new Set()

  props.readyRoutes
    .filter((route) => route.variantId === 'long')
    .forEach((route) => {
      route.mapPoints?.forEach((point) => {
        if (point?.name) {
          points.add(point.name)
        }
      })
    })

  return points.size
})
</script>

<template>
  <section class="new-hero">
    <div class="new-hero-content">
      <div class="top-brand">
        <img
          src="/logo222.png"
          alt="Открой Россию"
          class="top-brand-logo"
        >

        <div>
          <strong>Открой Россию</strong>
          <span>Память · маршруты · культура</span>
        </div>
      </div>

      <span class="hero-chip">
        История Москвы по эпохам
      </span>

      <h1>
        Пройдите Москву
        через десять исторических эпох
      </h1>

      <p>
        От княжеской Москвы и первых Романовых
        до Великой Отечественной войны и космического рывка.
        У каждой темы есть короткий, средний и длинный формат.
      </p>

      <div class="hero-actions-row">
        <button
          type="button"
          class="hero-main-btn"
          @click="$emit('show-history')"
        >
          Смотреть 10 маршрутов
        </button>

        <button
          type="button"
          class="hero-secondary-btn"
          @click="$emit('show-planner')"
        >
          Создать маршрут
        </button>
      </div>

      <div class="hero-stats-row">
        <div>
          <strong>{{ routeThemes.length || 10 }}</strong>
          <span>исторических тем</span>
        </div>

        <div>
          <strong>30</strong>
          <span>вариантов прохождения</span>
        </div>

        <div>
          <strong>{{ uniqueHistoricalPoints || '60+' }}</strong>
          <span>исторических точек</span>
        </div>
      </div>
    </div>

    <aside
      v-if="recommendedRoute"
      class="new-hero-card"
    >
      <span class="new-hero-card-label">
        Рекомендуемый маршрут
      </span>

      <h2>{{ recommendedRoute.title }}</h2>

      <p>{{ recommendedRoute.preview }}</p>

      <div class="new-route-tags">
        <span>{{ recommendedRoute.duration }}</span>
        <span>
          {{ recommendedRoute.mapPoints.length }} точек
        </span>
        <span>Аудиогид</span>
      </div>

      <button
        type="button"
        class="open-feature-route"
        @click="$emit('open-route', recommendedRoute.id)"
      >
        Начать маршрут
      </button>
    </aside>
  </section>

  <section class="new-directions">
    <article
      class="new-direction-card active"
      @click="$emit('show-history')"
    >
      <div class="new-direction-icon">🏛️</div>

      <div>
        <span>Основное направление</span>
        <h3>История Москвы</h3>
        <p>
          10 маршрутов от Средневековья
          до космической эпохи.
        </p>
      </div>
    </article>

    <article
      class="new-direction-card art"
      @click="$emit('show-art')"
    >
      <div class="new-direction-icon">🎨</div>

      <div>
        <span>Творчество</span>
        <h3>Москва в красках</h3>
        <p>
          Пленэры, городские ракурсы
          и задания для художников.
        </p>
      </div>
    </article>
  </section>

  <section
    v-if="routeMode === 'history' && !showPlanner"
    class="new-ready-section"
  >
    <div class="section-head route-catalog-head">
      <div>
        <span>Готовые маршруты</span>
        <h2>10 эпох — выберите формат</h2>
        <p>
          Один и тот же исторический сюжет можно пройти
          быстро, подробнее или за полный день.
        </p>
      </div>

      <button
        type="button"
        class="section-small-btn"
        @click="$emit('show-planner')"
      >
        Создать с ИИ
      </button>
    </div>

    <div class="route-duration-switch">
      <button
        v-for="option in durationOptions"
        :key="option.id"
        type="button"
        :class="{
          active:
            selectedDuration === option.id
        }"
        @click="selectedDuration = option.id"
      >
        <strong>{{ option.label }}</strong>
        <span>{{ option.hint }}</span>
      </button>
    </div>

    <div class="route-theme-grid">
      <article
        v-for="theme in visibleThemeCards"
        :key="theme.id"
        class="route-theme-card"
      >
        <div class="route-theme-top">
          <span class="route-theme-icon">
            {{ theme.icon }}
          </span>

          <span class="route-theme-epoch">
            {{ theme.epoch }}
          </span>
        </div>

        <h3>{{ theme.title }}</h3>

        <p>{{ theme.route.preview }}</p>

        <div class="route-theme-meta">
          <span>
            ⏱ {{ theme.route.duration }}
          </span>

          <span>
            📍 {{ theme.route.mapPoints.length }} точек
          </span>

          <span>🔊 Аудиогид</span>
        </div>

        <button
          type="button"
          class="ready-card-btn"
          @click.stop.prevent="
            $emit(
              'open-route',
              theme.route.id
            )
          "
        >
          Открыть {{ theme.route.variantLabel.toLowerCase() }} маршрут
        </button>
      </article>
    </div>
  </section>
<section
    v-if="
      routeMode === 'history' &&
      !showPlanner &&
      grandRoute
    "
    class="grand-route-section"
  >
    <div class="grand-route-card">
      <div class="grand-route-copy">
        <span class="grand-route-kicker">
          🚗 Москва → Подмосковье
        </span>

        <h2>{{ grandRoute.title }}</h2>

        <p>{{ grandRoute.preview }}</p>

        <div class="grand-route-meta">
          <span>🗓 {{ grandRoute.duration }}</span>
          <span>🚘 Автомобильный</span>
          <span>🛣 {{ grandRoute.distance }}</span>
          <span>
            📍 {{ grandRoute.mapPoints.length }} точек
          </span>
        </div>
      </div>

      <div class="grand-route-side">
        <span>Большой маршрут</span>

        <strong>
          Два исторических рубежа Москвы
        </strong>

        <p>
          1812 год → Бородино → 1941 год →
          Волоколамск и Дубосеково
        </p>

        <button
          type="button"
          class="grand-route-btn"
          @click="
            $emit(
              'open-route',
              grandRoute.id
            )
          "
        >
          Открыть маршрут
        </button>
      </div>
    </div>
  </section>
</template>
