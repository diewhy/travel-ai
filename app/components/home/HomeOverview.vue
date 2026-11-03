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
  <div class="rp-home">
    <section class="rp-intro">
      <div class="rp-intro-copy">
        <span class="rp-eyebrow">RUSSPLORE · ОТКРОЙ РОССИЮ</span>
        <h1>Откройте Москву по-новому</h1>
        <p>Готовые прогулки по истории и культуре города. Выбирайте маршрут и отправляйтесь навстречу открытиям.</p>
        <div class="rp-actions">
          <button type="button" class="rp-primary" @click="$emit('show-history')">
            <AppIcon name="route" /> Смотреть маршруты
          </button>
          <button type="button" class="rp-outline" @click="$emit('show-art')">
            <AppIcon name="palette" /> Москва в красках
          </button>
        </div>
      </div>
      <div v-if="recommendedRoute" class="rp-feature">
        <span class="rp-feature-kicker">Рекомендуем начать здесь</span>
        <h2>{{ recommendedRoute.title }}</h2>
        <p>{{ recommendedRoute.preview }}</p>
        <div class="rp-meta">
          <span>{{ recommendedRoute.duration }}</span>
          <span>{{ recommendedRoute.mapPoints?.length || 0 }} точек</span>
        </div>
        <button type="button" class="rp-feature-link" @click="$emit('open-route', recommendedRoute.id)">
          Открыть маршрут <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>

    <section class="rp-collections" aria-label="Направления путешествий">
      <button type="button" class="rp-collection" @click="$emit('show-history')">
        <span class="rp-collection-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m16.2 7.8-2.5 5.9-5.9 2.5 2.5-5.9z" />
          </svg>
        </span>
        <span><strong>История Москвы</strong><small>10 эпох и готовые прогулки</small></span>
        <span class="rp-collection-arrow" aria-hidden="true">→</span>
      </button>
      <button type="button" class="rp-collection" @click="$emit('show-art')">
        <span class="rp-collection-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" />
            <circle cx="7.5" cy="11" r="1" />
            <circle cx="10" cy="7" r="1" />
            <circle cx="15" cy="7.5" r="1" />
          </svg>
        </span>
        <span><strong>Москва в красках</strong><small>Город, искусство и творчество</small></span>
        <span class="rp-collection-arrow" aria-hidden="true">→</span>
      </button>
    </section>

    <section v-if="routeMode === 'history' && !showPlanner" class="rp-catalog">
      <div class="rp-section-heading">
        <div>
          <span class="rp-eyebrow">ГОТОВЫЕ МАРШРУТЫ</span>
          <h2>Выберите свою прогулку</h2>
          <p>Десять исторических тем — три варианта продолжительности.</p>
        </div>
      </div>

      <div class="rp-duration" role="group" aria-label="Продолжительность маршрута">
        <button
          v-for="option in durationOptions"
          :key="option.id"
          type="button"
          :class="{ selected: selectedDuration === option.id }"
          :aria-pressed="selectedDuration === option.id"
          @click="selectedDuration = option.id"
        >
          <strong>{{ option.label }}</strong>
          <small>{{ option.hint }}</small>
        </button>
      </div>

      <div class="rp-route-grid">
        <button
          v-for="theme in visibleThemeCards"
          :key="theme.id"
          type="button"
          class="rp-route-card"
          @click="$emit('open-route', theme.route.id)"
        >
          <span class="rp-route-top">
            <span class="rp-route-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block;width:20px;height:20px;min-width:20px;visibility:visible;opacity:1">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span class="rp-route-epoch">{{ theme.epoch }}</span>
          </span>
          <strong class="rp-route-title">{{ theme.title }}</strong>
          <span class="rp-route-description">{{ theme.route.preview }}</span>
          <span class="rp-route-bottom">
            <span>{{ theme.route.duration }} · {{ theme.route.mapPoints?.length || 0 }} точек</span>
            <span class="rp-route-arrow" aria-hidden="true">→</span>
          </span>
        </button>
      </div>
    </section>

    <section v-if="routeMode === 'history' && !showPlanner && grandRoute" class="rp-grand">
      <div>
        <span class="rp-eyebrow">АВТОМОБИЛЬНОЕ ПУТЕШЕСТВИЕ</span>
        <h2>{{ grandRoute.title }}</h2>
        <p>{{ grandRoute.preview }}</p>
        <div class="rp-meta">
          <span>{{ grandRoute.duration }}</span>
          <span>{{ grandRoute.distance }}</span>
          <span>{{ grandRoute.mapPoints?.length || 0 }} точек</span>
        </div>
      </div>
      <button type="button" class="rp-primary" @click="$emit('open-route', grandRoute.id)">
        Открыть маршрут <span aria-hidden="true">→</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.rp-home { display: flex; flex-direction: column; gap: 24px; width: 100%; color: #183047; }
.rp-intro { display: grid; grid-template-columns: minmax(0,1.25fr) minmax(250px,.75fr); align-items: center; gap: 30px; background: #fff; border: 1px solid #e5edf0; border-radius: 24px; padding: clamp(24px,4vw,48px); }
.rp-eyebrow { display: block; color: #0d9488; font-size: 11px; font-weight: 800; letter-spacing: .1em; }
.rp-intro h1 { max-width: 620px; margin: 14px 0 12px; color: #183047; font-size: clamp(30px,3.7vw,52px); line-height: 1.09; letter-spacing: -.045em; }
.rp-intro p, .rp-section-heading p, .rp-grand p { color: #657789; line-height: 1.65; }
.rp-intro-copy > p { max-width: 560px; font-size: 15px; }
.rp-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 25px; }
.rp-primary, .rp-outline { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 44px; padding: 11px 18px; border-radius: 11px; font-size: 13px; font-weight: 750; cursor: pointer; }
.rp-primary { border: 1px solid #0d9488; background: #0d9488; color: #fff; }
.rp-primary:hover { background: #087e74; }
.rp-outline { border: 1px solid #dce8e8; background: #fff; color: #264a55; }
.rp-outline:hover { background: #f0f8f7; }
.rp-feature { display: flex; flex-direction: column; gap: 12px; padding: 24px; background: #f1f8f7; border: 1px solid #dcece9; border-radius: 18px; }
.rp-feature-kicker { font-size: 11px; font-weight: 800; color: #0d9488; }
.rp-feature h2 { margin: 0; color: #183047; font-size: 23px; line-height: 1.2; }
.rp-feature p { margin: 0; font-size: 13px; }
.rp-meta { display: flex; flex-wrap: wrap; gap: 9px; font-size: 12px; color: #526e7a; }
.rp-meta span { padding: 6px 9px; border-radius: 7px; background: #fff; }
.rp-feature-link { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; border: 0; background: transparent; padding: 5px 0; color: #087e74; font-weight: 800; text-align: left; cursor: pointer; }
.rp-collections { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
.rp-collection { display: flex; align-items: center; gap: 15px; padding: 20px; border: 1px solid #e5edf0; border-radius: 16px; background: #fff; color: #183047; text-align: left; cursor: pointer; }
.rp-collection:hover, .rp-route-card:hover { border-color: #90cbc4; box-shadow: 0 8px 28px rgba(24,48,71,.06); }
.rp-collection-icon, .rp-route-icon { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; background: #e9f6f3; color: #0d9488; }
.rp-collection strong, .rp-collection small { display: block; }
.rp-collection strong { font-size: 15px; }
.rp-collection small { margin-top: 5px; font-size: 12px; color: #738494; }
.rp-collection-arrow { margin-left: auto; color: #0d9488; font-size: 20px; }
.rp-catalog { padding: 28px; border-radius: 22px; background: #fff; border: 1px solid #e5edf0; }
.rp-section-heading h2 { margin: 9px 0 4px; color: #183047; font-size: clamp(24px,2.5vw,32px); letter-spacing: -.03em; }
.rp-section-heading p { margin: 0; font-size: 13px; }
.rp-duration { display: inline-flex; flex-wrap: wrap; gap: 5px; margin: 23px 0; padding: 5px; border-radius: 12px; background: #f1f5f7; }
.rp-duration button { display: flex; flex-direction: column; gap: 3px; min-width: 115px; padding: 9px 15px; border: 0; border-radius: 9px; background: transparent; color: #607484; cursor: pointer; }
.rp-duration button.selected { background: #fff; color: #0d9488; box-shadow: 0 2px 9px rgba(25,49,60,.09); }
.rp-duration strong { font-size: 12px; }
.rp-duration small { font-size: 11px; }
.rp-route-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 13px; }
.rp-route-card { display: flex; flex-direction: column; gap: 12px; min-height: 195px; padding: 19px; border: 1px solid #e5edf0; border-radius: 15px; background: #fff; color: #183047; text-align: left; cursor: pointer; }
.rp-route-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rp-route-icon { width: 36px; height: 36px; flex-basis: 36px; }
.rp-route-epoch { max-width: 70%; color: #748696; font-size: 11px; text-align: right; }
.rp-route-title { font-size: 17px; line-height: 1.25; }
.rp-route-description { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: #687d8d; font-size: 12px; line-height: 1.5; }
.rp-route-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f4; color: #728392; font-size: 11px; }
.rp-route-arrow { color: #0d9488; font-size: 20px; }
.rp-grand { display: flex; align-items: center; justify-content: space-between; gap: 30px; padding: 30px; border: 1px solid #dcece9; border-radius: 20px; background: #edf7f5; }
.rp-grand h2 { margin: 10px 0; color: #183047; font-size: 25px; }
.rp-grand p { margin: 0 0 15px; max-width: 650px; font-size: 13px; }
.rp-grand .rp-primary { flex-shrink: 0; }
@media (max-width: 900px) { .rp-intro { grid-template-columns: 1fr; } }
@media (max-width: 650px) { .rp-collections, .rp-route-grid { grid-template-columns: 1fr; } .rp-catalog { padding: 18px; } .rp-intro { padding: 24px; } .rp-grand { flex-direction: column; align-items: stretch; padding: 22px; } .rp-duration { display: flex; } .rp-duration button { min-width: 0; flex: 1; padding: 9px 5px; } }
</style>
