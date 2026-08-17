<script setup>
const props = defineProps({
  routeStops: { type: Array, default: () => [] },
  visitedStopIds: { type: Array, default: () => [] },
  routeProgressPercent: { type: Number, default: 0 },
  routeDurationName: { type: String, default: '—' }
})

defineEmits(['start-route', 'open-stop'])

function isStopVisited(stopId) {
  return props.visitedStopIds.includes(stopId)
}
</script>

<template>
  <section class="route-stops-section">
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
        @click="$emit('start-route')"
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

      <strong>{{ routeDurationName }}</strong>
    </div>

    <div class="route-stops-grid">
      <article
        v-for="stop in routeStops"
        :key="stop.id"
        class="route-stop-card"
        :class="{ completed: isStopVisited(stop.id) }"
        @click="$emit('open-stop', stop)"
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
</template>
