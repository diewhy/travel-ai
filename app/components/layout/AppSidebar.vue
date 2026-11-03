<script setup>
import AppIcon from '../ui/AppIcon.vue'

defineProps({
  userProfile: {
    type: Object,
    required: true
  }
})

defineEmits([
  'home',
  'routes',
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
        class="side-nav-btn active"
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
