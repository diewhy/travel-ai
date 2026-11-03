<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  yandexLoading: { type: Boolean, default: false },
  vkLoading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' }
})

const emit = defineEmits(['close', 'yandex', 'vk', 'guest'])
const closeButton = ref(null)

function closeModal() {
  if (!props.yandexLoading && !props.vkLoading) emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') closeModal()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  closeButton.value?.focus({ preventScroll: true })
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="rp-auth-backdrop" @click.self="closeModal">
    <section
      class="rp-auth-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rp-auth-title"
      aria-describedby="rp-auth-description"
    >
      <header class="rp-auth-topbar">
        <div class="rp-auth-brand">
          <div class="rp-auth-logo">
            <img src="/logo222.png" alt="" />
          </div>
          <div class="rp-auth-brand-copy">
            <strong>RUSSPLORE</strong>
            <span>Открой Россию</span>
          </div>
        </div>
        <button
          ref="closeButton"
          class="rp-auth-close"
          type="button"
          aria-label="Закрыть окно входа"
          :disabled="yandexLoading || vkLoading"
          @click="closeModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="rp-auth-intro">
        <span class="rp-auth-eyebrow">ЛИЧНЫЙ КАБИНЕТ ПУТЕШЕСТВЕННИКА</span>
        <h2 id="rp-auth-title">Путешествуйте с Russplore</h2>
        <p id="rp-auth-description">
          Войдите, чтобы сохранять прогресс прогулок, делиться фотографиями и получать баллы за открытия.
        </p>
      </div>

      <div class="rp-auth-benefits" aria-label="Возможности аккаунта">
        <span>Сохранение прогресса</span>
        <span>Отзывы и фото</span>
        <span>Баллы за задания</span>
      </div>

      <div class="rp-auth-signin">
        <p class="rp-auth-signin-label">Выберите способ входа</p>

        <button
          type="button"
          class="rp-auth-provider"
          :disabled="yandexLoading || vkLoading"
          :aria-busy="yandexLoading"
          @click="emit('yandex')"
        >
          <span class="rp-auth-provider-logo rp-auth-yandex" aria-hidden="true">Я</span>
          <span class="rp-auth-provider-copy">
            <strong>{{ yandexLoading ? 'Переходим в Яндекс…' : 'Войти через Яндекс ID' }}</strong>
            <small>Используйте свой Яндекс аккаунт</small>
          </span>
          <span v-if="yandexLoading" class="rp-auth-spinner" aria-hidden="true"></span>
          <svg v-else class="rp-auth-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <button
          type="button"
          class="rp-auth-provider"
          :disabled="yandexLoading || vkLoading"
          :aria-busy="vkLoading"
          @click="emit('vk')"
        >
          <span class="rp-auth-provider-logo rp-auth-vk" aria-hidden="true">VK</span>
          <span class="rp-auth-provider-copy">
            <strong>{{ vkLoading ? 'Переходим в VK ID…' : 'Войти через VK ID' }}</strong>
            <small>Вход через аккаунт ВКонтакте</small>
          </span>
          <span v-if="vkLoading" class="rp-auth-spinner" aria-hidden="true"></span>
          <svg v-else class="rp-auth-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <p v-if="errorMessage" class="rp-auth-error" role="alert">{{ errorMessage }}</p>

      <div class="rp-auth-separator"><span>или</span></div>

      <button
        type="button"
        class="rp-auth-guest"
        :disabled="yandexLoading || vkLoading"
        @click="emit('guest')"
      >
        <span>Продолжить как гость</span>
        <small>Без входа в личный кабинет</small>
      </button>

      <p class="rp-auth-note">
        При входе данные аккаунта используются для работы личного кабинета и сохранения прогресса.
      </p>
    </section>
  </div>
</template>

<style scoped>
.rp-auth-backdrop {
  position: fixed;
  inset: 0;
  z-index: 210;
  display: grid;
  place-items: center;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 24px;
  background: rgba(13, 31, 42, .58);
  -webkit-backdrop-filter: blur(7px);
  backdrop-filter: blur(7px);
}

.rp-auth-dialog {
  width: min(100%, 500px);
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
  margin: auto;
  padding: 28px;
  border: 1px solid #e0e9ed;
  border-radius: 24px;
  background: #fff;
  color: #193347;
  box-shadow: 0 28px 90px rgba(13, 40, 53, .22);
}

.rp-auth-topbar, .rp-auth-brand, .rp-auth-provider, .rp-auth-provider-copy {
  display: flex;
}
.rp-auth-topbar { justify-content: space-between; align-items: center; gap: 12px; }
.rp-auth-brand { align-items: center; gap: 11px; min-width: 0; }
.rp-auth-logo {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #eff8f5;
  overflow: hidden;
}
.rp-auth-logo img { display: block; width: 34px; height: 34px; object-fit: contain; }
.rp-auth-brand-copy strong, .rp-auth-brand-copy span { display: block; }
.rp-auth-brand-copy strong { font-size: 12px; font-weight: 800; letter-spacing: .095em; }
.rp-auth-brand-copy span { margin-top: 2px; font-size: 11px; color: #71828d; }
.rp-auth-close {
  display: grid;
  place-items: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: 1px solid #e5edef;
  border-radius: 11px;
  background: #f7fafb;
  color: #526c79;
}
.rp-auth-close svg { width: 20px; height: 20px; display: block; }
.rp-auth-close:hover { background: #eaf6f3; color: #056e64; }

.rp-auth-intro { padding-top: 31px; }
.rp-auth-eyebrow { color: #078b7c; font-size: 10px; font-weight: 800; letter-spacing: .105em; }
.rp-auth-intro h2 {
  margin: 9px 0 11px;
  color: #193347;
  font-size: clamp(25px, 4vw, 32px);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -.045em;
}
.rp-auth-intro p { margin: 0; color: #6b7f8c; font-size: 13px; line-height: 1.65; }
.rp-auth-benefits { display: flex; flex-wrap: wrap; gap: 7px; margin: 20px 0 23px; }
.rp-auth-benefits span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border-radius: 8px;
  background: #edf7f4;
  color: #187768;
  font-size: 10px;
  font-weight: 750;
}
.rp-auth-benefits span::before {
  content: '';
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #0d9488;
}

.rp-auth-signin-label { margin: 0 0 10px; font-size: 12px; font-weight: 800; color: #435d6c; }
.rp-auth-signin { display: grid; gap: 10px; }
.rp-auth-provider {
  width: 100%;
  min-height: 69px;
  align-items: center;
  gap: 13px;
  margin: 0;
  padding: 12px 13px;
  border: 1px solid #dce7ea;
  border-radius: 14px;
  background: #fff;
  color: #193347;
  text-align: left;
  transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.rp-auth-provider:hover:not(:disabled) {
  border-color: #8bc7bd;
  background: #f8fcfb;
  box-shadow: 0 6px 22px rgba(20, 52, 67, .06);
}
.rp-auth-provider-logo {
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: #fff;
  font-weight: 800;
}
.rp-auth-yandex { background: #fc3f1d; font-size: 24px; line-height: 1; }
.rp-auth-vk { background: #0077ff; font-size: 14px; letter-spacing: -.05em; }
.rp-auth-provider-copy { min-width: 0; flex: 1 1 auto; flex-direction: column; gap: 3px; }
.rp-auth-provider-copy strong { font-size: 13px; font-weight: 800; }
.rp-auth-provider-copy small { color: #82929c; font-size: 11px; line-height: 1.45; }
.rp-auth-chevron { flex: 0 0 20px; width: 20px; height: 20px; color: #a0adb4; }
.rp-auth-spinner {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  border: 2px solid #bce7dc;
  border-top-color: #078b7c;
  border-radius: 50%;
  animation: rp-auth-spin .8s linear infinite;
}
@keyframes rp-auth-spin { to { transform: rotate(360deg); } }
.rp-auth-separator { position: relative; margin: 19px 0 14px; text-align: center; color: #96a6af; font-size: 11px; }
.rp-auth-separator::before { content: ''; position: absolute; inset: 50% 0 auto; border-top: 1px solid #e4ecef; }
.rp-auth-separator span { position: relative; padding: 0 12px; background: #fff; }
.rp-auth-guest {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 100%;
  min-height: 56px;
  margin: 0;
  padding: 10px;
  border: 1px solid #d9e5e7;
  border-radius: 12px;
  background: #f6faf9;
  color: #126f65;
  font-size: 12px;
  font-weight: 800;
}
.rp-auth-guest:hover:not(:disabled) { border-color: #a8d8ce; background: #ebf7f3; }
.rp-auth-guest small { color: #738b90; font-size: 10px; font-weight: 500; }
.rp-auth-note { margin: 18px 5px 0; color: #91a0a9; text-align: center; font-size: 10px; line-height: 1.65; }
.rp-auth-error {
  margin: 13px 0 0;
  padding: 11px 13px;
  border: 1px solid #f2cece;
  border-radius: 10px;
  background: #fff4f4;
  color: #a53f3f;
  font-size: 12px;
}
.rp-auth-dialog button:focus-visible { outline: 3px solid #79d8c8; outline-offset: 2px; }
.rp-auth-dialog button:disabled { cursor: not-allowed; opacity: .55; }
@media (max-width: 560px) {
  .rp-auth-backdrop { padding: 10px; }
  .rp-auth-dialog { max-height: calc(100dvh - 20px); padding: 21px 17px; border-radius: 19px; }
  .rp-auth-intro { padding-top: 24px; }
  .rp-auth-intro h2 { font-size: 26px; }
  .rp-auth-benefits { margin-top: 17px; margin-bottom: 19px; }
  .rp-auth-provider { min-height: 65px; }
}
@media (prefers-reduced-motion: reduce) {
  .rp-auth-spinner { animation-duration: 2s; }
  .rp-auth-provider { transition: none; }
}
</style>
