<script setup>
defineProps({
  routeMode: { type: String, required: true },
  showPlanner: { type: Boolean, required: true },
  readyRoutes: { type: Array, default: () => [] }
})

defineEmits([
  'show-history',
  'show-planner',
  'show-art',
  'open-route'
])
</script>

<template>
  <section class="new-hero">
    <div class="new-hero-content">
      <div class="top-brand">
        <img src="/logo222.png" alt="Открой Россию" class="top-brand-logo">

        <div>
          <strong>Открой Россию</strong>
          <span>Память · маршруты · культура</span>
        </div>
      </div>

      <span class="hero-chip">Цифровая платформа маршрутов</span>

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
        <button type="button" class="hero-main-btn" @click="$emit('show-history')">
          Смотреть маршруты
        </button>

        <button type="button" class="hero-secondary-btn" @click="$emit('show-planner')">
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
      <span class="new-hero-card-label">Рекомендуемый маршрут</span>
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
        @click="$emit('open-route', 'short')"
      >
        Начать маршрут
      </button>
    </aside>
  </section>

  <section class="new-directions">
    <article class="new-direction-card active" @click="$emit('show-history')">
      <div class="new-direction-icon">🎖️</div>

      <div>
        <span>Направление</span>
        <h3>Военная история</h3>
        <p>Маршруты по мемориалам, музеям и памятным местам.</p>
      </div>
    </article>

    <article class="new-direction-card art" @click="$emit('show-art')">
      <div class="new-direction-icon">🎨</div>

      <div>
        <span>Творчество</span>
        <h3>Москва в красках</h3>
        <p>Пленэры, городские ракурсы и задания для художников.</p>
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

      <button type="button" class="section-small-btn" @click="$emit('show-planner')">
        Создать с ИИ
      </button>
    </div>

    <div class="new-ready-grid">
      <article
        v-for="route in readyRoutes"
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

          <span class="ready-card-duration">{{ route.duration }}</span>
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
          @click.stop.prevent="$emit('open-route', route.id)"
        >
          Открыть маршрут
        </button>
      </article>
    </div>
  </section>
</template>
