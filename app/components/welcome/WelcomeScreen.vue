<script setup>
defineProps({
  guestMode: {
    type: Boolean,
    default: false
  }
})

// API компонента не меняем: app.vue продолжает обрабатывать эти события.
defineEmits(['enter', 'preview'])
</script>

<template>
  <section class="rp-welcome" aria-label="Добро пожаловать в Russplore">
    <div class="rw-shell">
      <header class="rw-header">
        <div class="rw-brand">
          <span class="rw-brand-mark" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.7" />
            </svg>
          </span>
          <span class="rw-brand-copy">
            <strong>RUSSPLORE</strong>
            <small>Открой Россию</small>
          </span>
        </div>

        <div class="rw-header-meta">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="m16.2 7.8-2.5 5.9-5.9 2.5 2.5-5.9z" />
          </svg>
          <span>Путешествия с историей</span>
        </div>
      </header>

      <div class="rw-main">
        <div class="rw-intro">
          <div class="rw-eyebrow">
            <span class="rw-eyebrow-dot" aria-hidden="true"></span>
            ГОТОВЫЕ МАРШРУТЫ ПО МОСКВЕ
          </div>

          <h1>
            История города —<br>
            <span>в каждом шаге.</span>
          </h1>

          <p class="rw-lead">
            Исследуйте Москву через готовые прогулки по её истории и культуре.
            Открывайте знаковые места на карте, узнавайте их истории и
            сохраняйте впечатления.
          </p>

          <div class="rw-actions">
            <button
              type="button"
              class="rw-primary"
              @click="$emit('enter')"
            >
              <span>{{ guestMode ? 'Продолжить как гость' : 'Войти в платформу' }}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>

            <button
              type="button"
              class="rw-secondary"
              @click="$emit('preview')"
            >
              Посмотреть маршрут
            </button>
          </div>

          <p class="rw-note">
            Никакой сложной настройки — выберите готовую прогулку и отправляйтесь открывать город.
          </p>

          <div class="rw-highlights" aria-label="Возможности платформы">
            <div class="rw-highlight">
              <span class="rw-highlight-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                  <path d="M9 3v15m6-12v15" />
                </svg>
              </span>
              <span><strong>Готовые прогулки</strong><small>Маршруты с историей</small></span>
            </div>
            <div class="rw-highlight">
              <span class="rw-highlight-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <span><strong>Карта и точки</strong><small>Всё в одном месте</small></span>
            </div>
            <div class="rw-highlight">
              <span class="rw-highlight-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                  <path d="M12 3a9 9 0 1 1-9 9" />
                </svg>
              </span>
              <span><strong>Личный прогресс</strong><small>Фото, отзывы и баллы</small></span>
            </div>
          </div>
        </div>

        <div class="rw-showcase">
          <div class="rw-preview">
            <div class="rw-preview-top">
              <div>
                <span class="rw-preview-kicker">ПРИМЕР ПРОГУЛКИ</span>
                <h2>Москва. Дорогами памяти</h2>
                <p>Знакомые места, за которыми стоят важные истории.</p>
              </div>
              <span class="rw-preview-tag">Москва</span>
            </div>

            <div class="rw-map-illustration" aria-hidden="true">
              <div class="rw-map-stamp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                  <path d="M9 3v15m6-12v15" />
                </svg>
                Схема прогулки
              </div>
              <svg class="rw-route-line" width="460" height="260" viewBox="0 0 460 260" preserveAspectRatio="none">
                <path class="rw-road rw-road-one" d="M-35 185 100 70 225 110 335 -10 495 105" />
                <path class="rw-road" d="M-20 38 165 190 335 147 495 245" />
                <path class="rw-road" d="M100 -20 130 105 105 280" />
                <path class="rw-road" d="M345 -20 290 90 360 275" />
                <path class="rw-route-track-back" d="M82 199 C 125 209, 125 125, 190 142 S 245 197, 285 114 S 340 55, 374 66" />
                <path class="rw-route-track" d="M82 199 C 125 209, 125 125, 190 142 S 245 197, 285 114 S 340 55, 374 66" />
              </svg>
              <span class="rw-map-pin rw-map-pin-1">1</span>
              <span class="rw-map-pin rw-map-pin-2">2</span>
              <span class="rw-map-pin rw-map-pin-3">3</span>
              <span class="rw-map-pin rw-map-pin-4">4</span>
              <span class="rw-map-caption">Иллюстрация маршрута</span>
            </div>

            <div class="rw-preview-details">
              <div class="rw-preview-facts">
                <span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                  </svg>
                  2–3 часа
                </span>
                <span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
                  </svg>
                  6 точек
                </span>
                <span class="rw-format">Пешком</span>
              </div>
              <div class="rw-preview-place">
                <div class="rw-preview-place-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-7h6v7" />
                  </svg>
                </div>
                <p><strong>От Александровского сада до Красной площади</strong><span>Исторические места в центре столицы</span></p>
              </div>
              <button type="button" class="rw-preview-link" @click="$emit('preview')">
                Открыть пример маршрута
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div class="rw-showcase-footnote">
            <span class="rw-footnote-dot" aria-hidden="true"></span>
            Изучайте историю в собственном темпе
          </div>
        </div>
      </div>

      <footer class="rw-footer">
        <span>Russplore · Открой Россию</span>
        <span>История рядом. Стоит только отправиться в путь.</span>
      </footer>
    </div>
  </section>
</template>

<style>
/* Во время показа приветствия бокового меню нет. Убираем его резервный отступ в app.vue. */
.page:has(> .rp-welcome) {
  padding: 20px 24px 24px !important;
  background: #f5f8fa;
}

.rp-welcome,
.rp-welcome * { box-sizing: border-box; }
/* Guard against browser defaults for inline SVG: these must never expand to viewport size. */
.rp-welcome svg { display: block; width: 20px; height: 20px; max-width: 100%; flex-shrink: 0; }
.rp-welcome .rw-route-line { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; }
.rp-welcome {
  --rw-primary: #078b7c;
  --rw-primary-deep: #056e64;
  --rw-ink: #193347;
  --rw-muted: #6b7c88;
  --rw-border: #e1eae8;
  color: var(--rw-ink);
  display: block;
  width: min(100%, 1360px);
  min-height: calc(100dvh - 44px);
  margin: 0 auto;
  border: 1px solid #e4eceb;
  border-radius: 25px;
  background: radial-gradient(circle at 80% 13%, rgba(210, 245, 233, .42), transparent 29%), #fff;
  box-shadow: 0 18px 55px rgba(24, 58, 69, .055);
  overflow: hidden;
  isolation: isolate;
}
.rw-shell { min-height: inherit; display: flex; flex-direction: column; padding: 24px clamp(24px, 4vw, 60px) 18px; }
.rw-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.rw-brand { display: flex; align-items: center; gap: 11px; }
.rw-brand-mark { width: 43px; height: 43px; border-radius: 13px; display: grid; place-items: center; flex: 0 0 43px; background: var(--rw-primary); color: #fff; }
.rw-brand-mark svg { width: 23px; height: 23px; display: block; flex: none; }
.rw-brand-copy strong,.rw-brand-copy small { display: block; }
.rw-brand-copy strong { font-size: 14px; font-weight: 800; line-height: 1.15; letter-spacing: .075em; }
.rw-brand-copy small { margin-top: 4px; font-size: 11px; color: #758a92; }
.rw-header-meta { display: flex; align-items: center; gap: 9px; font-size: 12px; font-weight: 700; color: #6b828b; }
.rw-header-meta svg { display: block; width: 18px; height: 18px; flex: 0 0 18px; color: var(--rw-primary); }
.rw-main { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); align-items: center; gap: clamp(30px, 5vw, 74px); width: 100%; flex: 1; padding: clamp(34px, 6.5vh, 75px) 0 clamp(28px, 5.5vh, 60px); }
.rw-intro { min-width: 0; }
.rw-eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--rw-primary); font-size: 11px; font-weight: 800; letter-spacing: .095em; }
.rw-eyebrow-dot { width: 8px; height: 8px; flex: 0 0 8px; border-radius: 50%; background: var(--rw-primary); box-shadow: 0 0 0 5px #e4f5f0; }
.rw-intro h1 { margin: 22px 0 20px; font-size: clamp(39px, 4.5vw, 67px); font-weight: 800; line-height: 1.09; letter-spacing: -.052em; color: #193347; }
.rw-intro h1 span { color: var(--rw-primary); }
.rw-lead { max-width: 550px; margin: 0; color: #607987; font-size: clamp(14px, 1.18vw, 16px); line-height: 1.8; }
.rw-actions { display: flex; flex-wrap: wrap; gap: 11px; margin-top: 30px; }
.rw-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 13px; width: auto; min-height: 50px; margin: 0; padding: 12px 19px; border-radius: 12px; font-size: 13px; line-height: 1.2; font-weight: 800; cursor: pointer; transition: background-color .15s ease, border-color .15s ease, transform .15s ease; }
.rw-actions button:hover { transform: translateY(-1px); }
.rw-primary { background: var(--rw-primary); border: 1px solid var(--rw-primary); color: #fff; }
.rw-primary:hover { background: var(--rw-primary-deep); border-color: var(--rw-primary-deep); }
.rw-primary svg { display: block; flex: 0 0 18px; width: 18px; height: 18px; }
.rw-secondary { background: #fff; border: 1px solid #d7e4e3; color: #24475a; }
.rw-secondary:hover { background: #f3faf8; border-color: #95cdc5; }
.rw-note { margin: 14px 0 0; max-width: 520px; font-size: 11px; line-height: 1.7; color: #8497a0; }
.rw-highlights { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: clamp(34px, 5vw, 62px); }
.rw-highlight { display: flex; align-items: flex-start; gap: 9px; min-width: 0; padding-top: 16px; border-top: 1px solid #e6eeec; }
.rw-highlight-icon { width: 27px; height: 27px; flex: 0 0 27px; display: grid; place-items: center; color: var(--rw-primary); background: #eaf6f2; border-radius: 8px; }
.rw-highlight-icon svg { width: 16px; height: 16px; display: block; }
.rw-highlight strong,.rw-highlight small { display: block; }
.rw-highlight strong { color: #29485a; font-weight: 800; line-height: 1.35; font-size: 11px; }
.rw-highlight small { margin-top: 4px; font-size: 10px; line-height: 1.5; color: #8397a1; }
.rw-showcase { min-width: 0; }
.rw-preview { overflow: hidden; border: 1px solid #dce9e7; border-radius: 23px; background: #fff; box-shadow: 0 24px 64px rgba(23, 76, 72, .10); }
.rw-preview-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; padding: 25px 26px 21px; }
.rw-preview-top > div { min-width: 0; }
.rw-preview-kicker { color: var(--rw-primary); font-size: 10px; font-weight: 800; letter-spacing: .12em; }
.rw-preview-top h2 { margin: 9px 0 8px; font-size: clamp(20px, 2vw, 26px); line-height: 1.22; color: var(--rw-ink); }
.rw-preview-top p { margin: 0; color: #728995; font-size: 12px; line-height: 1.6; }
.rw-preview-tag { padding: 6px 10px; flex-shrink: 0; border-radius: 100px; background: #eaf7f2; color: var(--rw-primary-deep); font-size: 10px; font-weight: 800; }
.rw-map-illustration { position: relative; height: 258px; margin: 0 15px; overflow: hidden; border-radius: 14px; background: linear-gradient(135deg,#e8f5f1,#e8f1ee 53%,#f1f8f5); }
.rw-map-illustration::before { content: ''; position: absolute; width: 210px; height: 210px; border-radius: 50%; left: -50px; bottom: -90px; background: rgba(125, 196, 170, .16); }
.rw-map-illustration::after { content: ''; position: absolute; width: 150px; height: 150px; border-radius: 32px; right: -55px; top: -58px; transform: rotate(30deg); background: rgba(255, 255, 255, .47); }
.rw-map-stamp { position: absolute; z-index: 3; top: 17px; left: 18px; display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid #d3e6df; border-radius: 9px; background: rgba(255,255,255,.82); color: #557c73; font-weight: 800; font-size: 10px; }
.rw-map-stamp svg { width: 15px; height: 15px; display: block; }
.rw-route-line { position: absolute; inset: 0; display: block; width: 100%; height: 100%; z-index: 1; }
.rw-road { fill: none; stroke: #fff; stroke-opacity: .85; stroke-width: 20; }
.rw-road-one { stroke-width: 30; }
.rw-route-track-back { fill: none; stroke: rgba(255,255,255,.92); stroke-width: 12; stroke-linecap: round; stroke-linejoin: round; }
.rw-route-track { fill: none; stroke: #07917f; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1 0; }
.rw-map-pin { position: absolute; z-index: 2; display: grid; place-items: center; width: 30px; height: 30px; margin: -15px 0 0 -15px; border: 4px solid #fff; border-radius: 50%; background: #0b9182; color: #fff; box-shadow: 0 3px 11px rgba(8,100,85,.22); font-size: 10px; font-weight: 800; }
.rw-map-pin-1 { left: 17.8%; top: 76.5%; }
.rw-map-pin-2 { left: 41.3%; top: 54.5%; }
.rw-map-pin-3 { left: 62%; top: 46%; }
.rw-map-pin-4 { left: 81.3%; top: 25.5%; }
.rw-map-caption { position: absolute; right: 13px; bottom: 12px; z-index: 3; color: #789d94; font-size: 9px; }
.rw-preview-details { padding: 21px 26px 23px; }
.rw-preview-facts { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rw-preview-facts > span { display: inline-flex; align-items: center; gap: 6px; padding: 7px 9px; border-radius: 8px; background: #f0f7f6; color: #54767c; font-weight: 700; font-size: 11px; }
.rw-preview-facts svg { width: 14px; height: 14px; display: block; flex: 0 0 14px; color: var(--rw-primary); }
.rw-preview-facts .rw-format { color: #627e7d; }
.rw-preview-place { display: flex; align-items: center; gap: 10px; margin: 21px 0; }
.rw-preview-place-icon { display: grid; place-items: center; flex: 0 0 36px; width: 36px; height: 36px; border-radius: 10px; background: #e8f6f2; color: var(--rw-primary); }
.rw-preview-place-icon svg { width: 19px; height: 19px; display: block; }
.rw-preview-place p { min-width: 0; margin: 0; }
.rw-preview-place strong,.rw-preview-place span { display: block; }
.rw-preview-place strong { color: #284659; font-size: 12px; line-height: 1.35; }
.rw-preview-place span { color: #8a9ea6; font-size: 11px; margin-top: 4px; }
.rw-preview-link { width: 100%; margin: 0; padding: 12px 0 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; border: none; border-top: 1px solid #edf1f1; background: transparent; color: var(--rw-primary-deep); font-size: 12px; font-weight: 800; text-align: left; cursor: pointer; }
.rw-preview-link:hover { color: #035a52; }
.rw-preview-link svg { width: 17px; height: 17px; display: block; flex: 0 0 17px; }
.rw-showcase-footnote { display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 16px; color: #8ca29e; font-size: 11px; }
.rw-footnote-dot { width: 5px; height: 5px; background: #73beaa; border-radius: 50%; }
.rw-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-top: 15px; border-top: 1px solid #eef1f1; color: #91a2aa; font-size: 10px; }
.rw-footer span:last-child { text-align: right; }
.rp-welcome button:focus-visible { outline: 3px solid #6bd5bd; outline-offset: 3px; }
@media (max-width: 1130px) {
  .rw-main { grid-template-columns: 1fr 1fr; gap: 30px; }
  .rw-highlights { grid-template-columns: 1fr; gap: 9px; margin-top: 25px; }
  .rw-highlight { padding-top: 10px; }
  .rw-intro h1 { font-size: clamp(36px, 4.1vw, 53px); }
}
@media (max-width: 830px) {
  .rw-main { grid-template-columns: 1fr; gap: 38px; }
  .rw-highlights { grid-template-columns: repeat(3, 1fr); gap: 11px; }
  .rw-header-meta { display: none; }
  .rw-showcase { width: min(100%, 560px); margin: 0 auto; }
}
@media (max-width: 560px) {
  .page:has(> .rp-welcome) { padding: 10px !important; }
  .rp-welcome { border-radius: 19px; min-height: calc(100dvh - 20px); }
  .rw-shell { padding: 21px 18px 16px; }
  .rw-main { padding: 37px 0 28px; gap: 30px; }
  .rw-intro h1 { font-size: clamp(33px, 9vw, 43px); margin: 19px 0; }
  .rw-lead { line-height: 1.7; }
  .rw-actions { gap: 9px; }
  .rw-actions button { width: 100%; }
  .rw-highlights { grid-template-columns: 1fr; }
  .rw-preview-top { padding: 19px 17px 17px; }
  .rw-preview-top h2 { font-size: 20px; }
  .rw-preview-tag { display: none; }
  .rw-map-illustration { height: 205px; margin: 0 10px; }
  .rw-preview-details { padding: 18px 16px; }
  .rw-footer { flex-direction: column; align-items: flex-start; gap: 5px; }
  .rw-footer span:last-child { text-align: left; }
}
@media (prefers-reduced-motion: reduce) {
  .rw-actions button { transition: none; }
}
</style>
