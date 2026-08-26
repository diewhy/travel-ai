<script setup>
import PointCommunity from './PointCommunity.vue'

defineProps({
  stop: {
    type: Object,
    required: true
  },

  visited: {
    type: Boolean,
    default: false
  },

  user: {
    type: Object,
    default: null
  },

  userProfile: {
    type: Object,
    default: () => ({})
  },

  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'close',
  'play-audio',
  'mark-visited',
  'request-auth',
  'profile-changed'
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
        <template v-if="stop.day">
          День {{ stop.day }} ·
        </template>
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

      <PointCommunity
        :stop="stop"
        :user="user"
        :user-profile="userProfile"
        :is-authenticated="isAuthenticated"
        @request-auth="$emit('request-auth')"
        @profile-changed="$emit('profile-changed')"
      />
    </article>
  </div>
</template>
