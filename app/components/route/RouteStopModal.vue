<script setup>
defineProps({
  stop: {
    type: Object,
    required: true
  },

  visited: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'close',
  'play-audio',
  'mark-visited'
])
</script>

<template>
  <div
    class="stop-modal-overlay"
    @click.self="$emit('close')"
  >
    <article class="stop-modal">
      <button
        type="button"
        class="stop-modal-close"
        @click="$emit('close')"
      >
        ×
      </button>

      <span class="stop-modal-label">
        Точка {{ stop.number }} маршрута
      </span>

      <h2>{{ stop.name }}</h2>

      <div class="stop-modal-block">
        <h3>📖 Историческая справка</h3>
        <p>{{ stop.description }}</p>
      </div>

      <div class="stop-modal-block">
        <h3>🎯 Задание на точке</h3>
        <p>{{ stop.task }}</p>
      </div>

      <button
        type="button"
        class="audio-guide-btn"
        @click="$emit('play-audio', stop)"
      >
        🔊 Прослушать аудиогид
      </button>

      <button
        v-if="!visited"
        type="button"
        class="visit-stop-btn"
        @click="$emit('mark-visited', stop)"
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
