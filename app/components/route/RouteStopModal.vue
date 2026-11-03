<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import PointCommunity from './PointCommunity.vue'

// Russplore 2.0: тот же API, что и в app.vue и старой версии RouteStopModal.vue.
const props = defineProps({
  stop: { type: Object, required: true },
  visited: { type: Boolean, default: false },
  user: { type: Object, default: null },
  userProfile: { type: Object, default: () => ({}) },
  isAuthenticated: { type: Boolean, default: false }
})

const emit = defineEmits([
  'close',
  'play-audio',
  'mark-visited',
  'request-auth',
  'profile-changed'
])

const dialogRef = ref(null)
let previousFocus = null

function handleDialogKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab' || !dialogRef.value) return

  const controls = Array.from(
    dialogRef.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => element.getClientRects().length > 0)

  if (!controls.length) {
    event.preventDefault()
    return
  }

  const first = controls[0]
  const last = controls[controls.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === dialogRef.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || active === dialogRef.value)) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(async () => {
  previousFocus = document.activeElement
  await nextTick()
  dialogRef.value?.focus()
})

onBeforeUnmount(() => {
  if (previousFocus && previousFocus.isConnected) previousFocus.focus()
})
</script>

<template>
  <div class="stop-modal-overlay rp2-stop-overlay" @click.self="emit('close')">
    <article
      ref="dialogRef"
      class="stop-modal rp2-stop-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rp2-stop-title"
      tabindex="-1"
      @keydown="handleDialogKeydown"
    >
      <header class="rp2-stop-hero">
        <div class="rp2-stop-hero-top">
          <div class="rp2-stop-brand">
            <span class="rp2-stop-brand-dot" aria-hidden="true"></span>
            RUSSPLORE
            <span class="rp2-stop-brand-separator" aria-hidden="true">/</span>
            ТОЧКА МАРШРУТА
          </div>
          <button
            type="button"
            class="stop-modal-close rp2-stop-close"
            aria-label="Закрыть информацию о точке"
            @click="emit('close')"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="rp2-stop-hero-content">
          <div class="rp2-stop-tags">
            <span class="rp2-stop-tag">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <template v-if="stop.day">День {{ stop.day }} · </template>
              Точка {{ stop.number ?? '—' }}
            </span>
            <span v-if="visited" class="rp2-stop-tag rp2-stop-tag--visited">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
              Посещено
            </span>
          </div>
          <h2 id="rp2-stop-title">{{ stop.name || 'Остановка маршрута' }}</h2>
          <p>Исследуйте место, узнайте его историю и сохраните впечатления от посещения.</p>
        </div>
      </header>

      <div class="rp2-stop-body">
        <div class="rp2-stop-grid" :class="{ 'rp2-stop-grid--single': !stop.task }">
          <section class="rp2-stop-info-card">
            <div class="rp2-stop-section-head">
              <span class="rp2-stop-icon" aria-hidden="true">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
                  <path d="M4 5.5V21M8 7h8M8 11h6" />
                </svg>
              </span>
              <div>
                <span class="rp2-stop-section-kicker">О МЕСТЕ</span>
                <h3>Историческая справка</h3>
              </div>
            </div>
            <p class="rp2-stop-description">{{ stop.description || 'Описание этой точки пока не добавлено.' }}</p>
          </section>

          <section v-if="stop.task" class="rp2-stop-info-card rp2-stop-task-card">
            <div class="rp2-stop-section-head">
              <span class="rp2-stop-icon rp2-stop-icon--task" aria-hidden="true">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
              </span>
              <div>
                <span class="rp2-stop-section-kicker">НА ЭТОЙ ТОЧКЕ</span>
                <h3>Небольшое задание</h3>
              </div>
            </div>
            <p class="rp2-stop-description">{{ stop.task }}</p>
          </section>
        </div>

        <div class="rp2-stop-action-panel">
          <div class="rp2-stop-action-copy">
            <span class="rp2-stop-action-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 9v6M8 5v14M12 8v8M16 4v16M20 9v6" />
              </svg>
            </span>
            <div>
              <strong>Продолжить знакомство с местом</strong>
              <p>Прослушайте аудиогид и отметьте посещение точки.</p>
            </div>
          </div>
          <div class="rp2-stop-actions">
            <button
              type="button"
              class="audio-guide-btn rp2-stop-audio-btn"
              @click="emit('play-audio', stop)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
              Прослушать аудиогид
            </button>

            <button
              v-if="!visited"
              type="button"
              class="visit-stop-btn rp2-stop-visit-btn"
              @click="emit('mark-visited', stop)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
              Я посетил эту точку
            </button>

            <div v-else class="stop-completed-message rp2-stop-done" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m5 12 4 4L19 6" />
              </svg>
              Точка пройдена
            </div>
          </div>
        </div>

        <section class="rp2-stop-community-panel" aria-label="Фотографии и отзывы об этой точке">
          <PointCommunity
            :stop="stop"
            :user="user"
            :user-profile="userProfile"
            :is-authenticated="isAuthenticated"
            @request-auth="emit('request-auth')"
            @profile-changed="emit('profile-changed')"
          />
        </section>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Russplore 2.0 — автономное окно достопримечательности. */
.stop-modal-overlay.rp2-stop-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 3vw, 32px);
  background: rgba(11, 34, 47, .68);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
}
.stop-modal.rp2-stop-dialog {
  position: relative;
  top: auto;
  left: auto;
  z-index: 201;
  display: block;
  width: min(100%, 920px);
  max-height: min(92dvh, 940px);
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  transform: none;
  border: 1px solid #dce7e9;
  border-radius: 23px;
  background: #f7fafb;
  color: #193347;
  box-shadow: 0 25px 90px rgba(6, 24, 35, .28);
  outline: none;
}
.rp2-stop-dialog *, .rp2-stop-dialog *::before, .rp2-stop-dialog *::after { box-sizing: border-box; }
.rp2-stop-dialog button { font: inherit; }
.rp2-stop-dialog button:focus-visible, .rp2-stop-dialog a:focus-visible { outline: 3px solid #54d2c0; outline-offset: 3px; }
.rp2-stop-hero {
  position: relative;
  padding: clamp(22px, 3.6vw, 37px);
  overflow: hidden;
  background: radial-gradient(ellipse at 100% 0%, rgba(39, 158, 142, .22), transparent 55%), linear-gradient(115deg, #173b4a, #164f53);
  color: #fff;
}
.rp2-stop-hero::after {
  content: '';
  position: absolute;
  right: -90px;
  bottom: -160px;
  width: 330px;
  height: 330px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 50%;
  box-shadow: 0 0 0 48px rgba(255,255,255,.025), 0 0 0 105px rgba(255,255,255,.02);
  pointer-events: none;
}
.rp2-stop-hero-top { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; gap: 14px; }
.rp2-stop-brand { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; font-size: 10px; font-weight: 800; letter-spacing: .13em; color: rgba(255,255,255,.84); }
.rp2-stop-brand-dot { display: inline-block; flex: 0 0 7px; width: 7px; height: 7px; border-radius: 50%; background: #7ce2c7; box-shadow: 0 0 0 4px rgba(124,226,199,.13); }
.rp2-stop-brand-separator { opacity: .4; font-weight: 400; }
.stop-modal-close.rp2-stop-close {
  position: relative;
  inset: auto;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  min-width: 38px;
  padding: 0;
  margin: 0;
  border: 1px solid rgba(255,255,255,.26);
  border-radius: 11px;
  background: rgba(255,255,255,.11);
  color: #fff;
  cursor: pointer;
}
.rp2-stop-close:hover { background: rgba(255,255,255,.2); }
.rp2-stop-hero-content { position: relative; z-index: 1; max-width: 760px; margin-top: 27px; }
.rp2-stop-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.rp2-stop-tag { display: inline-flex; align-items: center; gap: 7px; padding: 7px 11px; border: 1px solid rgba(255,255,255,.22); border-radius: 9px; background: rgba(255,255,255,.12); color: #fff; font-size: 11px; font-weight: 750; }
.rp2-stop-tag--visited { border-color: rgba(126,237,194,.26); background: rgba(46,152,113,.2); color: #bdfbe1; }
.rp2-stop-hero-content h2 { max-width: 750px; margin: 17px 0 12px; color: white; font-size: clamp(26px, 3.4vw, 37px); line-height: 1.18; font-weight: 800; letter-spacing: -.035em; }
.rp2-stop-hero-content p { max-width: 650px; margin: 0; color: rgba(255,255,255,.78); font-size: 13px; line-height: 1.7; }
.rp2-stop-body { display: flex; flex-direction: column; gap: 19px; padding: clamp(16px, 3vw, 27px); }
.rp2-stop-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.rp2-stop-grid--single { grid-template-columns: 1fr; }
.rp2-stop-info-card { min-width: 0; padding: clamp(17px, 2.5vw, 24px); border: 1px solid #e0e9ed; border-radius: 16px; background: #fff; }
.rp2-stop-task-card { border-color: #d9ede6; background: #f0f9f5; }
.rp2-stop-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.rp2-stop-icon { display: grid; place-items: center; flex: 0 0 43px; width: 43px; height: 43px; border-radius: 12px; color: #078b7c; background: #e6f5f1; }
.rp2-stop-icon--task { background: #dff2e9; }
.rp2-stop-section-kicker { display: block; margin-bottom: 3px; color: #078b7c; font-size: 10px; font-weight: 800; letter-spacing: .11em; }
.rp2-stop-section-head h3 { margin: 0; color: #193347; font-size: 16px; font-weight: 800; line-height: 1.3; }
.rp2-stop-description { margin: 0; color: #526c7c; white-space: pre-line; font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
.rp2-stop-action-panel { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px; padding: 20px; border: 1px solid #dceae7; border-radius: 16px; background: #fff; }
.rp2-stop-action-copy { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1 1 230px; }
.rp2-stop-action-icon { display: grid; place-items: center; flex: 0 0 43px; width: 43px; height: 43px; border-radius: 12px; background: #e9f6f3; color: #078b7c; }
.rp2-stop-action-copy strong { display: block; color: #193347; font-size: 13px; font-weight: 800; }
.rp2-stop-action-copy p { margin: 3px 0 0; color: #718491; font-size: 11px; line-height: 1.55; }
.rp2-stop-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; }
.audio-guide-btn.rp2-stop-audio-btn, .visit-stop-btn.rp2-stop-visit-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: auto;
  min-height: 43px;
  margin: 0;
  padding: 10px 13px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}
.audio-guide-btn.rp2-stop-audio-btn { border: 1px solid #dbe8e8; color: #176d69; background: #fff; }
.audio-guide-btn.rp2-stop-audio-btn:hover { background: #edf8f5; }
.visit-stop-btn.rp2-stop-visit-btn { border: 1px solid #078b7c; color: #fff; background: #078b7c; }
.visit-stop-btn.rp2-stop-visit-btn:hover { background: #056e64; }
.stop-completed-message.rp2-stop-done { display: inline-flex; align-items: center; gap: 8px; min-height: 43px; margin: 0; padding: 10px 13px; border-radius: 10px; color: #126e59; background: #e1f4ec; font-size: 12px; font-weight: 800; }
.rp2-stop-community-panel { min-width: 0; padding: clamp(17px, 2.6vw, 24px); border: 1px solid #e0e9ed; border-radius: 17px; background: #fff; }
.rp2-stop-dialog :deep(.point-community) { margin-top: 0; }
.rp2-stop-dialog :deep(.community-divider) { display: none; }
.rp2-stop-dialog :deep(.community-heading) { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
.rp2-stop-dialog :deep(.community-heading h3) { margin: 4px 0 0; color: #193347; font-size: 21px; letter-spacing: -.025em; }
.rp2-stop-dialog :deep(.community-kicker) { color: #078b7c; font-size: 11px; font-weight: 800; }
.rp2-stop-dialog :deep(.community-section) { padding: clamp(14px, 2vw, 19px); border: 1px solid #e1e9ed; border-radius: 13px; background: #fcfefe; box-shadow: none; }
.rp2-stop-dialog :deep(.community-section h4) { margin: 4px 0 0; color: #193347; font-size: 15px; }
.rp2-stop-dialog :deep(.community-section-head) { display: flex; gap: 10px; flex-wrap: wrap; align-items: start; }
.rp2-stop-dialog :deep(.community-action-btn) { width: auto; max-width: 100%; margin-top: 9px; }
.rp2-stop-dialog :deep(.community-photo-grid) { grid-template-columns: repeat(2, minmax(0,1fr)); }
.rp2-stop-dialog :deep(.community-photo img) { max-width: 100%; }
.rp2-stop-dialog :deep(.community-file-input) { max-width: 100%; }
.rp2-stop-dialog :deep(.review-editor textarea) { width: 100%; }
@media (max-width: 780px) {
  .rp2-stop-grid { grid-template-columns: 1fr; }
  .rp2-stop-action-panel { align-items: stretch; }
  .rp2-stop-actions { width: 100%; }
  .rp2-stop-actions > * { flex: 1 1 180px; }
}
@media (max-width: 600px) {
  .stop-modal-overlay.rp2-stop-overlay { padding: 0; }
  .stop-modal.rp2-stop-dialog { width: 100%; height: 100dvh; max-height: 100dvh; border: 0; border-radius: 0; }
  .rp2-stop-hero { padding: 22px 20px 27px; }
  .rp2-stop-hero-content { margin-top: 24px; }
  .rp2-stop-hero-content h2 { font-size: 29px; }
  .rp2-stop-brand { gap: 6px; font-size: 9px; }
  .rp2-stop-body { gap: 14px; padding: 15px; }
  .rp2-stop-action-panel { padding: 16px; }
  .rp2-stop-actions { flex-direction: column; align-items: stretch; }
  .rp2-stop-actions > * { flex: initial; width: 100% !important; white-space: normal; }
  .rp2-stop-community-panel { padding: 15px; }
  .rp2-stop-dialog :deep(.community-review-list),
  .rp2-stop-dialog :deep(.community-photo-grid) { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .rp2-stop-dialog * { scroll-behavior: auto !important; }
}
</style>
