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

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 22px;
  display: grid;
  place-items: center;
  background: rgba(2, 8, 23, 0.76);
  backdrop-filter: blur(16px);
}

.auth-modal-card {
  position: relative;
  width: min(100%, 520px);
  padding: 30px;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  color: white;
  background:
    radial-gradient(
      circle at top right,
      rgba(14, 165, 233, 0.2),
      transparent 38%
    ),
    linear-gradient(
      160deg,
      rgba(9, 34, 73, 0.98),
      rgba(4, 17, 40, 0.99)
    );
  box-shadow: 0 30px 100px rgba(0, 10, 35, 0.56);
}

.auth-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: white;
  background: rgba(255, 255, 255, 0.09);
  box-shadow: none;
  font-size: 25px;
}

.auth-modal-brand {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-right: 48px;
}

.auth-modal-brand img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.auth-modal-brand strong,
.auth-modal-brand span {
  display: block;
}

.auth-modal-brand strong {
  font-size: 16px;
}

.auth-modal-brand span {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.56);
  font-size: 12px;
}

.auth-modal-copy {
  margin-top: 30px;
}

.auth-modal-chip {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  color: #bae6fd;
  background: rgba(14, 165, 233, 0.13);
  border: 1px solid rgba(125, 211, 252, 0.2);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.auth-modal-copy h2 {
  margin: 12px 0 10px;
  font-size: clamp(28px, 6vw, 38px);
  line-height: 1.08;
}

.auth-modal-copy p {
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.auth-provider-btn {
  width: 100%;
  margin: 0 0 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  box-shadow: none;
}

.auth-provider-btn.yandex {
  color: #111827;
  background: white;
}

.auth-provider-btn.vk {
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.07);
}

.auth-provider-btn:disabled {
  cursor: not-allowed;
}

.auth-provider-btn.yandex:disabled {
  opacity: 0.72;
}

.auth-provider-btn.vk:disabled {
  opacity: 0.46;
}

.auth-provider-icon {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 900;
}

.yandex .auth-provider-icon {
  color: white;
  background: #fc3f1d;
}

.vk .auth-provider-icon {
  color: white;
  background: #0077ff;
  font-size: 12px;
}

.auth-provider-btn strong,
.auth-provider-btn small {
  display: block;
}

.auth-provider-btn strong {
  font-size: 15px;
}

.auth-provider-btn small {
  margin-top: 3px;
  opacity: 0.6;
  font-size: 11px;
}

.auth-modal-error {
  margin: 14px 0 0;
  padding: 11px 13px;
  border-radius: 14px;
  color: #fecaca;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.2);
  font-size: 12px;
  line-height: 1.5;
}

.auth-modal-note {
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.42);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 560px) {
  .auth-modal-overlay {
    padding: 12px;
  }

  .auth-modal-card {
    padding: 24px 18px;
    border-radius: 24px;
  }
}
</style>
