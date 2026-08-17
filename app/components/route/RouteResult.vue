<script setup>
defineProps({
  routeMode: { type: String, required: true },
  place: { type: String, default: '' },
  routeDurationName: { type: String, default: '—' },
  budget: { type: [String, Number], default: '' },
  activeRouteImage: { type: String, default: '' },
  currentGallery: { type: Array, default: () => [] },
  activeImageIndex: { type: Number, default: 0 },
  history: { type: String, default: '' },
  memoryPlaces: { type: Array, default: () => [] },
  pleinairs: { type: Array, default: () => [] },
  formattedResult: { type: String, default: '' }
})

defineEmits(['select-image', 'download-pdf'])
</script>

<template>
  <section class="result-wrap">
    <div
      class="route-header route-header-image"
      :style="{
        backgroundImage:
          `linear-gradient(rgba(5,15,35,.35), rgba(5,15,35,.88)), url(${activeRouteImage})`
      }"
    >
      <div class="route-gallery-dots">
        <button
          v-for="(image, index) in currentGallery"
          :key="image"
          type="button"
          class="gallery-line"
          :class="{ active: activeImageIndex === index }"
          @click="$emit('select-image', index)"
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
        {{
          routeMode === 'moscowArt'
            ? '🏛️ О локации'
            : '📖 Историческая справка'
        }}
      </h3>
      <p>{{ history }}</p>
    </div>

    <div v-if="memoryPlaces.length" class="memory-card">
      <h3>
        {{
          routeMode === 'moscowArt'
            ? '🎨 Что будем рисовать'
            : '🎖️ Объекты военно-исторического наследия'
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

    <div class="result" v-html="formattedResult"></div>

    <button
      type="button"
      class="pdf-btn"
      @click="$emit('download-pdf')"
    >
      📄 Скачать PDF
    </button>
  </section>
</template>
