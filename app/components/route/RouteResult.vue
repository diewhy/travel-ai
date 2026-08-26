<script setup>
import { computed } from 'vue'

const props = defineProps({
  routeMode: { type: String, required: true },
  routeTitle: { type: String, default: '' },
  routeAbout: { type: String, default: '' },
  place: { type: String, default: '' },
  days: { type: [String, Number], default: '' },
  routeDurationName: { type: String, default: '—' },
  routePointsCount: { type: Number, default: 0 },
  mapTravelMode: { type: String, default: 'pedestrian' },
  activeRouteImage: { type: String, default: '' },
  currentGallery: { type: Array, default: () => [] },
  activeImageIndex: { type: Number, default: 0 },
  history: { type: String, default: '' },
  memoryPlaces: { type: Array, default: () => [] },
  pleinairs: { type: Array, default: () => [] },
  formattedResult: { type: String, default: '' },
  showGeneratedText: { type: Boolean, default: true },
  pdfLoading: { type: Boolean, default: false }
})

defineEmits(['select-image', 'download-pdf'])

const transportName = computed(() =>
  props.mapTravelMode === 'auto'
    ? 'Автомобильный'
    : 'Пеший'
)
</script>

<template>
  <section class="result-wrap">
    <div
      class="route-header route-header-image"
      :style="{
        backgroundImage: `url('${activeRouteImage}')`
      }"
    >
      <div class="route-gallery-dots">
        <button
          v-for="(image, index) in currentGallery"
          :key="image"
          type="button"
          class="gallery-line"
          :class="{ active: activeImageIndex === index }"
          :aria-label="`Фото ${index + 1}`"
          @click="$emit('select-image', index)"
        ></button>
      </div>

      <div class="route-hero-copy">
        <p class="route-label">
          {{
            routeMode === 'moscowArt'
              ? 'Творческий маршрут'
              : 'Готовый исторический маршрут'
          }}
        </p>

        <h2>
          {{
            routeMode === 'moscowArt'
              ? `Москва в красках: ${place || 'Москва'}`
              : routeTitle || `Маршрут: ${place || 'Россия'}`
          }}
        </h2>

        <p
          v-if="routeAbout || history"
          class="route-hero-description"
        >
          {{ routeAbout || history }}
        </p>

        <div class="route-stats">
          <span>⏱ {{ routeDurationName }}</span>
          <span v-if="routePointsCount">📍 {{ routePointsCount }} точек</span>
          <span>🧭 {{ transportName }}</span>
          <span v-if="Number(days) > 1">🗓 {{ days }} дня</span>
        </div>
      </div>
    </div>

    <div v-if="history" class="history-card route-story-card">
      <span class="route-card-kicker">Погружение в эпоху</span>
      <h3>
        {{
          routeMode === 'moscowArt'
            ? '🏛️ О локации'
            : '📖 История маршрута'
        }}
      </h3>
      <p>{{ history }}</p>
    </div>

    <div v-if="memoryPlaces.length" class="memory-card">
      <span class="route-card-kicker">Что увидим</span>
      <h3>
        {{
          routeMode === 'moscowArt'
            ? '🎨 Что будем рисовать'
            : '📍 Главные точки маршрута'
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
          <li v-for="draw in item.draw" :key="draw">
            {{ draw }}
          </li>
        </ul>

        <p><strong>Навык:</strong> {{ item.skill }}</p>
        <p><strong>Лучшее время:</strong> {{ item.bestTime }}</p>
        <p><strong>Продолжительность:</strong> {{ item.duration }}</p>
        <p><strong>Совет:</strong> {{ item.tip }}</p>
      </div>
    </div>

    <section
      v-if="showGeneratedText && formattedResult"
      class="generated-route-details"
    >
      <div class="generated-route-details-head">
        <span class="route-card-kicker">
          Персональный маршрут
        </span>
        <h3>Подробный план путешествия</h3>
        <p>
          План, рекомендации и детали,
          подготовленные для выбранного формата.
        </p>
      </div>

      <div
        class="result generated-route-text"
        v-html="formattedResult"
      ></div>
    </section>

    <button
      type="button"
      class="pdf-btn"
      :disabled="pdfLoading"
      @click="$emit('download-pdf')"
    >
      {{
        pdfLoading
          ? 'Формируем PDF…'
          : '📄 Скачать красивый PDF'
      }}
    </button>
  </section>
</template>
