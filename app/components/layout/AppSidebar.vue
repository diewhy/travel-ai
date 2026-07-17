<script setup>
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
        <span>⌂</span>
        Главная
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('routes')"
      >
        <span>🧭</span>
        Маршруты
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('map')"
      >
        <span>📍</span>
        Карта
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('create-route')"
      >
        <span>✦</span>
        Создать маршрут
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('art')"
      >
        <span>🎨</span>
        Москва в красках
      </button>

      <button
        type="button"
        class="side-nav-btn"
        @click="$emit('profile')"
      >
        <span>👤</span>
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
        {{ userProfile.initials }}
      </div>

      <div>
        <strong>{{ userProfile.name }}</strong>
        <span>{{ userProfile.points }} баллов</span>
      </div>
    </button>
  </aside>
</template>
