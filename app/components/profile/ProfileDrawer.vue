<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  userProfile: { type: Object, required: true },
  progressPercent: { type: Number, default: 0 },
  logoutLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'logout'])
const drawerRef = ref(null)

const safeProgress = computed(() => {
  const value = Number(props.progressPercent)
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
})

const pointsToNextLevel = computed(() =>
  Math.max(0, (Number(props.userProfile.nextLevelPoints) || 0) - (Number(props.userProfile.points) || 0))
)

function onEscape(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onEscape)
  drawerRef.value?.focus({ preventScroll: true })
})

onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <div class="rp-profile-overlay" @click.self="emit('close')">
    <aside
      ref="drawerRef"
      class="rp-profile-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rp-profile-heading"
      tabindex="-1"
    >
      <header class="rp-profile-toolbar">
        <div class="rp-profile-brand">
          <span class="rp-profile-logo" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="m16.2 7.8-2.5 5.9-5.9 2.5 2.5-5.9z" />
            </svg>
          </span>
          <div class="rp-profile-brand-text">
            <strong>RUSSPLORE</strong>
            <span>Личный кабинет</span>
          </div>
        </div>

        <button type="button" class="rp-profile-close" aria-label="Закрыть личный кабинет" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="rp-profile-content">
        <section class="rp-profile-user">
          <div class="rp-profile-avatar">
            <img
              v-if="userProfile.avatarUrl"
              :src="userProfile.avatarUrl"
              :alt="userProfile.name || 'Аватар пользователя'"
              referrerpolicy="no-referrer"
            >
            <span v-else>{{ userProfile.initials || 'Г' }}</span>
          </div>

          <div class="rp-profile-user-info">
            <span class="rp-profile-kicker">ПРОФИЛЬ ПУТЕШЕСТВЕННИКА</span>
            <h2 id="rp-profile-heading">{{ userProfile.name || 'Путешественник' }}</h2>
            <p class="rp-profile-role">{{ userProfile.role || 'Участник проекта' }}</p>
            <div v-if="userProfile.authProvider || userProfile.email" class="rp-profile-meta">
              <span v-if="userProfile.authProvider" class="rp-profile-provider">{{ userProfile.authProvider }}</span>
              <span v-if="userProfile.email" class="rp-profile-email" :title="userProfile.email">{{ userProfile.email }}</span>
            </div>
          </div>
        </section>

        <section class="rp-profile-level" aria-label="Ваш уровень">
          <div class="rp-profile-level-header">
            <span class="rp-profile-level-mark" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 2 2.8 6.1 6.7.8-5 4.6 1.3 6.6-5.8-3.2-5.8 3.2 1.3-6.6-5-4.6 6.7-.8L12 2Z" />
              </svg>
            </span>
            <div class="rp-profile-level-title">
              <span>ВАШ ПРОГРЕСС</span>
              <strong>Уровень {{ userProfile.level ?? 1 }}</strong>
            </div>
            <span class="rp-profile-level-percent">{{ Math.round(safeProgress) }}%</span>
          </div>

          <div
            class="rp-profile-progress-track"
            role="progressbar"
            aria-label="Прогресс до следующего уровня"
            :aria-valuenow="safeProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="rp-profile-progress-fill" :style="{ width: `${safeProgress}%` }"></div>
          </div>

          <div class="rp-profile-level-foot">
            <span><strong>{{ userProfile.points ?? 0 }}</strong> / {{ userProfile.nextLevelPoints ?? 0 }} баллов</span>
            <span>Осталось {{ pointsToNextLevel }}</span>
          </div>
        </section>

        <section class="rp-profile-section" aria-labelledby="rp-profile-stats-title">
          <div class="rp-profile-section-heading">
            <div>
              <span class="rp-profile-kicker">ВАШИ ДОСТИЖЕНИЯ</span>
              <h3 id="rp-profile-stats-title">Статистика путешествий</h3>
            </div>
          </div>

          <div class="rp-profile-stats">
            <article class="rp-profile-stat">
              <span class="rp-profile-stat-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="6" cy="19" r="2" /><path d="M9 19h8a4 4 0 0 0 0-8H7a4 4 0 0 1 0-8h8m-3-2 3 2-3 2" />
                </svg>
              </span>
              <strong>{{ userProfile.routesCompleted ?? 0 }}</strong>
              <span>Пройдено маршрутов</span>
            </article>

            <article class="rp-profile-stat">
              <span class="rp-profile-stat-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="3" /><path d="m8 12 3 3 5-6" />
                </svg>
              </span>
              <strong>{{ userProfile.tasksCompleted ?? 0 }}</strong>
              <span>Выполнено заданий</span>
            </article>

            <article class="rp-profile-stat">
              <span class="rp-profile-stat-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 7h4l2-2h4l2 2h4v12H4V7Z" /><circle cx="12" cy="13" r="3.1" />
                </svg>
              </span>
              <strong>{{ userProfile.photosUploaded ?? 0 }}</strong>
              <span>Загружено фото</span>
            </article>

            <article class="rp-profile-stat">
              <span class="rp-profile-stat-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-7A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h8m-8 4h5" />
                </svg>
              </span>
              <strong>{{ userProfile.reviewsLeft ?? 0 }}</strong>
              <span>Оставлено отзывов</span>
            </article>
          </div>
        </section>

        <section class="rp-profile-section" aria-labelledby="rp-profile-activities-title">
          <div class="rp-profile-section-heading">
            <div>
              <span class="rp-profile-kicker">УЧАСТВУЙТЕ И ИССЛЕДУЙТЕ</span>
              <h3 id="rp-profile-activities-title">Активности и баллы</h3>
            </div>
          </div>

          <div class="rp-profile-activity-list">
            <article class="rp-profile-activity">
              <div class="rp-profile-activity-symbol" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="6" width="18" height="15" rx="3" /><path d="M8 6 9.5 3h5L16 6" /><circle cx="12" cy="13.5" r="3.2" />
                </svg>
              </div>
              <div class="rp-profile-activity-body">
                <span class="rp-profile-activity-label">ЗАДАНИЯ ОТ РВИО</span>
                <h4>Поделитесь фотографией</h4>
                <p>Сфотографируйте достопримечательность во время прогулки и загрузите снимок на странице точки.</p>
                <span class="rp-profile-reward">+50 баллов</span>
              </div>
            </article>

            <article class="rp-profile-activity">
              <div class="rp-profile-activity-symbol" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-7A7.5 7.5 0 1 1 20 11.5Z" /><path d="m9 11.5 2 2 4-4" />
                </svg>
              </div>
              <div class="rp-profile-activity-body">
                <span class="rp-profile-activity-label">ОТЗЫВЫ О ТОЧКАХ</span>
                <h4>Расскажите о впечатлениях</h4>
                <p>Оцените посещённое место и оставьте отзыв, чтобы помочь другим путешественникам.</p>
                <span class="rp-profile-reward">+15 баллов</span>
              </div>
            </article>
          </div>
        </section>

        <footer class="rp-profile-footer">
          <button
            type="button"
            class="rp-profile-logout"
            :disabled="logoutLoading"
            @click="emit('logout')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5m5 5H9" />
            </svg>
            {{ logoutLoading ? 'Выходим…' : 'Выйти из аккаунта' }}
          </button>
          <p>Открывайте новые места вместе с Russplore</p>
        </footer>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.rp-profile-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(13, 31, 43, .52);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.rp-profile-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(480px, 100vw);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #f8fafb;
  color: #193347;
  box-shadow: -18px 0 70px rgba(12, 42, 52, .2);
  outline: none;
  font-family: Manrope, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.rp-profile-panel :where(*) { box-sizing: border-box; }
.rp-profile-panel :where(svg) { display: block; flex: none; }
.rp-profile-toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 26px;
  border-bottom: 1px solid #e5ecee;
  background: rgba(255, 255, 255, .96);
  backdrop-filter: blur(10px);
}
.rp-profile-brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
.rp-profile-logo {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border-radius: 12px;
  background: #e6f4f0;
  color: #078b7c;
}
.rp-profile-brand-text { display: flex; flex-direction: column; line-height: 1.3; }
.rp-profile-brand-text strong { font-size: 12px; font-weight: 800; letter-spacing: .07em; color: #163748; }
.rp-profile-brand-text span { font-size: 11px; color: #7c8d97; }
.rp-profile-close {
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
  margin: 0;
  padding: 0;
  border: 1px solid #e1e9ed;
  border-radius: 11px;
  background: #fff;
  color: #657986;
  cursor: pointer;
}
.rp-profile-close:hover { background: #e9f6f3; color: #057b70; }
.rp-profile-content { display: flex; flex-direction: column; gap: 24px; padding: 26px; }

.rp-profile-user { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rp-profile-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 74px;
  width: 74px;
  height: 74px;
  overflow: hidden;
  border: 3px solid #fff;
  border-radius: 22px;
  background: linear-gradient(135deg, #0e9b87, #0d5b62);
  color: #fff;
  box-shadow: 0 7px 22px rgba(9, 120, 110, .15);
}
.rp-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.rp-profile-avatar > span { font-size: 23px; font-weight: 800; letter-spacing: -.03em; }
.rp-profile-user-info { min-width: 0; flex: 1; }
.rp-profile-kicker { display: block; color: #078b7c; font-size: 10px; font-weight: 800; letter-spacing: .075em; }
.rp-profile-user-info h2 { margin: 5px 0 4px; font-size: 21px; line-height: 1.23; color: #163748; letter-spacing: -.025em; overflow-wrap: anywhere; }
.rp-profile-role { margin: 0; color: #657986; font-size: 12px; }
.rp-profile-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 5px 9px; margin-top: 9px; }
.rp-profile-provider { padding: 3px 8px; border-radius: 7px; background: #e9f4f1; color: #13766c; font-size: 10px; font-weight: 750; }
.rp-profile-email { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #748693; font-size: 10px; }

.rp-profile-level {
  padding: 19px;
  border: 1px solid #dcece6;
  border-radius: 18px;
  background: linear-gradient(145deg, #f2faf6, #fff);
}
.rp-profile-level-header { display: flex; align-items: center; gap: 12px; }
.rp-profile-level-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; background: #dff2eb; color: #078b7c; }
.rp-profile-level-title { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
.rp-profile-level-title > span { font-size: 10px; font-weight: 800; letter-spacing: .07em; color: #6e8f8a; }
.rp-profile-level-title > strong { font-size: 17px; color: #163748; }
.rp-profile-level-percent { margin-left: auto; font-size: 22px; font-weight: 800; color: #078b7c; }
.rp-profile-progress-track { height: 9px; margin-top: 19px; overflow: hidden; border-radius: 999px; background: #dcece7; }
.rp-profile-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #12ac8b, #078b7c); transition: width .25s ease; }
.rp-profile-level-foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 7px; margin-top: 10px; color: #6e848e; font-size: 11px; }
.rp-profile-level-foot strong { color: #183c42; }
.rp-profile-section { min-width: 0; }
.rp-profile-section-heading { margin-bottom: 12px; }
.rp-profile-section-heading h3 { margin: 5px 0 0; color: #193347; font-size: 18px; letter-spacing: -.025em; }

.rp-profile-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.rp-profile-stat { display: flex; flex-direction: column; min-width: 0; min-height: 141px; padding: 16px; border: 1px solid #e2ebed; border-radius: 15px; background: #fff; }
.rp-profile-stat-icon { display: grid; place-items: center; width: 35px; height: 35px; margin-bottom: 9px; border-radius: 10px; background: #eaf6f2; color: #078b7c; }
.rp-profile-stat > strong { font-size: 25px; line-height: 1.1; color: #193347; font-variant-numeric: tabular-nums; }
.rp-profile-stat > span:last-child { margin-top: 5px; color: #7a8e99; font-size: 11px; line-height: 1.45; }

.rp-profile-activity-list { display: flex; flex-direction: column; gap: 10px; }
.rp-profile-activity { display: flex; align-items: flex-start; gap: 12px; padding: 17px; border: 1px solid #e2ebed; border-radius: 15px; background: #fff; }
.rp-profile-activity-symbol { display: grid; place-items: center; flex: 0 0 39px; width: 39px; height: 39px; border-radius: 12px; background: #eaf6f2; color: #078b7c; }
.rp-profile-activity-body { flex: 1; min-width: 0; }
.rp-profile-activity-label { color: #0b8b7b; font-size: 10px; font-weight: 800; letter-spacing: .055em; }
.rp-profile-activity-body h4 { margin: 4px 0 7px; color: #193347; font-size: 14px; line-height: 1.35; letter-spacing: -.015em; }
.rp-profile-activity-body p { margin: 0 0 10px; color: #748693; font-size: 11px; line-height: 1.65; }
.rp-profile-reward { display: inline-flex; padding: 5px 8px; border-radius: 7px; background: #eaf7ed; color: #25804e; font-size: 11px; font-weight: 800; }

.rp-profile-footer { display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 19px; border-top: 1px solid #e4eaec; }
.rp-profile-logout { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; min-height: 45px; padding: 11px 16px; margin: 0; border: 1px solid #efd9d9; border-radius: 11px; background: #fff; color: #a44a4b; font-size: 12px; font-weight: 800; cursor: pointer; }
.rp-profile-logout:hover:not(:disabled) { background: #fff3f3; }
.rp-profile-logout:disabled { opacity: .55; cursor: wait; }
.rp-profile-footer p { margin: 0; color: #8b9aa3; font-size: 10px; text-align: center; }
.rp-profile-close:focus-visible, .rp-profile-logout:focus-visible { outline: 3px solid #74d8c9; outline-offset: 2px; }

@media (max-width: 520px) {
  .rp-profile-toolbar { padding: 15px 18px; }
  .rp-profile-content { gap: 21px; padding: 20px 17px 28px; }
  .rp-profile-avatar { flex-basis: 62px; width: 62px; height: 62px; border-radius: 18px; }
  .rp-profile-user { gap: 12px; }
  .rp-profile-user-info h2 { font-size: 19px; }
  .rp-profile-kicker { font-size: 9px; }
  .rp-profile-level { padding: 16px; }
  .rp-profile-stat { min-height: 132px; padding: 13px; }
  .rp-profile-activity { padding: 13px; }
}
@media (prefers-reduced-motion: reduce) { .rp-profile-progress-fill { transition: none; } }
</style>
