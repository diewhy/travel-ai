<script setup>
const props = defineProps({
  routeMode: {
    type: String,
    required: true
  },

  place: {
    type: String,
    default: ''
  },

  routeDuration: {
    type: String,
    required: true
  },

  days: {
    type: [String, Number],
    default: ''
  },

  budget: {
    type: [String, Number],
    default: ''
  },

  cityGroups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'update:route-mode',
  'update:place',
  'update:route-duration',
  'update:days',
  'update:budget',
  'generate'
])

function selectMode(mode) {
  emit('update:route-mode', mode)
  emit('update:place', '')
}

function selectDuration(duration, days) {
  emit('update:route-duration', duration)
  emit('update:days', days)
}
</script>

<template>
  <transition name="slide-up">
    <section class="planner-card new-planner-card">
      <button
        type="button"
        class="close-btn"
        @click="$emit('close')"
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
          @click="selectMode('history')"
        >
          Военная история
        </div>

        <div
          class="mode-btn"
          :class="{ active: routeMode === 'moscowArt' }"
          @click="selectMode('moscowArt')"
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
              @click="$emit('update:place', city)"
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
          @click="selectDuration('short', '1')"
        >
          🕐 Короткий
          <span>2–3 часа</span>
        </button>

        <button
          type="button"
          class="duration-btn"
          :class="{ active: routeDuration === 'day' }"
          @click="selectDuration('day', '1')"
        >
          🌇 На день
          <span>6–8 часов</span>
        </button>

        <button
          type="button"
          class="duration-btn"
          :class="{ active: routeDuration === 'long' }"
          @click="selectDuration('long', '3')"
        >
          🗓 Несколько дней
          <span>2–3 дня</span>
        </button>
      </div>

      <input
        :value="budget"
        type="number"
        :placeholder="
          routeMode === 'moscowArt'
            ? 'Бюджет на материалы, ₽'
            : 'Бюджет, ₽'
        "
        @input="$emit('update:budget', $event.target.value)"
      >

      <button
        type="button"
        @click="$emit('generate')"
      >
        {{
          routeMode === 'moscowArt'
            ? 'Создать маршрут плэнера'
            : 'Сгенерировать маршрут'
        }}
      </button>
    </section>
  </transition>
</template>
