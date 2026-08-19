<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },

  errorMessage: {
    type: String,
    default: ''
  }
})

defineEmits([
  'close',
  'yandex'
])
</script>

<template>
  <div
    class="auth-modal-overlay"
    @click.self="$emit('close')"
  >
    <section class="auth-modal-card">
      <button
        type="button"
        class="auth-modal-close"
        aria-label="Закрыть"
        @click="$emit('close')"
      >
        ×
      </button>

      <div class="auth-modal-brand">
        <img
          src="/logo222.png"
          alt="Открой Россию"
        />

        <div>
          <strong>Открой Россию</strong>
          <span>Личный кабинет путешественника</span>
        </div>
      </div>

      <div class="auth-modal-copy">
        <span class="auth-modal-chip">
          Авторизация
        </span>

        <h2>Войдите в платформу</h2>

        <p>
          Сохраняйте прогресс маршрутов, получайте баллы
          и открывайте награды за прохождение исторических точек.
        </p>
      </div>

      <button
        type="button"
        class="auth-provider-btn yandex"
        :disabled="loading"
        @click="$emit('yandex')"
      >
        <span class="auth-provider-icon">
          Я
        </span>

        <span>
          <strong>
            {{ loading ? 'Переходим в Яндекс…' : 'Войти через Яндекс' }}
          </strong>

          <small>
            Без отдельного пароля в «Открой Россию»
          </small>
        </span>
      </button>

      <button
        type="button"
        class="auth-provider-btn vk"
        disabled
      >
        <span class="auth-provider-icon">
          VK
        </span>

        <span>
          <strong>Войти через VK ID</strong>
          <small>Подключим следующим шагом</small>
        </span>
      </button>

      <p
        v-if="errorMessage"
        class="auth-modal-error"
      >
        {{ errorMessage }}
      </p>

      <p class="auth-modal-note">
        Продолжая, вы разрешаете сервису использовать данные
        профиля только для работы личного кабинета.
      </p>
    </section>
  </div>
</template>
