<script setup>
import AppIcon from '../ui/AppIcon.vue'

defineProps({
  accessibleActive: { type: Boolean, default: false },
  userProfile: {
    type: Object,
    required: true
  }
})

defineEmits([
  'home',
  'routes',
  'accessible',
  'map',
  'create-route',
  'art',
  'profile'
])
</script>

<template>
  <aside class="site-sidebar">
    <button
      type="button"
      class="side-brand"
      @click="$emit('home')"
    >
      <img
        src="/logo222.png"
        alt="Открой Россию"
      >

      <span>
        <strong>Открой Россию</strong>
        <small>Память · маршруты · культура</small>
      </span>
    </button>

    <nav class="side-nav">
      <button
        type="button"
        class="side-nav-btn"
        :class="{ active: !accessibleActive }"
        @click="$emit('home')"
      >
        <AppIcon name="house" />
        Главная
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('routes')"
      >
        <AppIcon name="compass" />
        Маршруты
      </button>

      <button
        type="button"
        class="side-nav-btn"
        :class="{ active: accessibleActive }"
        :aria-current="accessibleActive ? 'page' : undefined"
        @click="$emit('accessible')"
      >
        <svg class="rp-side-access-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11.5" cy="4.5" r="1.8" />
          <path d="M11.5 7v6h5l2.6 4.5" />
          <path d="M11.5 10H8.4" />
          <path d="M7.2 12.5a6.6 6.6 0 1 0 9.8 7.2" />
        </svg>
        Без барьеров
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('map')"
      >
        <AppIcon name="map-pin" />
        Карта
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('create-route')"
      >
        <AppIcon name="route" />
        Создать маршрут
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('art')"
      >
        <AppIcon name="palette" />
        Москва в красках
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('profile')"
      >
        <AppIcon name="user-round" />
        Личный кабинет
      </button>
    </nav>

    <div class="side-rvio-card">
      <span>Задания РВИО</span>

      <strong>
        Выполняйте задания на точках и получайте баллы
      </strong>

      <button
        type="button"
        @click="$emit('profile')"
      >
        Смотреть задания
      </button>
    </div>

    <button
      type="button"
      class="side-user-card"
      @click="$emit('profile')"
    >
      <div class="side-user-avatar">
        <img
          v-if="userProfile.avatarUrl"
          :src="userProfile.avatarUrl"
          :alt="userProfile.name"
          referrerpolicy="no-referrer"
        >

        <span v-else>
          {{ userProfile.initials }}
        </span>
      </div>

      <div>
        <strong>{{ userProfile.name }}</strong>
        <span>{{ userProfile.points }} баллов</span>
      </div>
    </button>
  </aside>
</template>

<style scoped>
.rp-side-access-icon { display: block; flex: 0 0 20px; width: 20px !important; height: 20px !important; }
</style>
