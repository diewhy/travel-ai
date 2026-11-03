<script setup>
import { computed } from 'vue'

const props = defineProps({
  routeMode: { type: String, required: true },
  routeTitle: { type: String, default: '' },
  routeAbout: { type: String, default: '' },
  place: { type: String, default: '' },
  days: { type: [String, Number], default: '' },
  routeDurationName: { type: String, default: '—' },
  routePointsCount: { type: Number, default: 0 },
  mapTravelMode: { type: String, default: 'pedestrian' },
  activeRouteImage: { type: String, default: '' },
  currentGallery: { type: Array, default: () => [] },
  activeImageIndex: { type: Number, default: 0 },
  history: { type: String, default: '' },
  memoryPlaces: { type: Array, default: () => [] },
  pleinairs: { type: Array, default: () => [] },
  formattedResult: { type: String, default: '' },
  showGeneratedText: { type: Boolean, default: true },
  pdfLoading: { type: Boolean, default: false }
})

defineEmits(['select-image', 'download-pdf'])

const isArt = computed(() => props.routeMode === 'moscowArt')
const transportName = computed(() =>
  props.mapTravelMode === 'auto' ? 'На автомобиле' : 'Пешком'
)
const displayTitle = computed(() =>
  isArt.value
    ? `Москва в красках: ${props.place || 'Москва'}`
    : props.routeTitle || `Маршрут: ${props.place || 'Россия'}`
)
const pointsLabel = computed(() => {
  const n = props.routePointsCount
  const last = n % 10
  const lastTwo = n % 100
  const unit = last === 1 && lastTwo !== 11
    ? 'точка'
    : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)
      ? 'точки'
      : 'точек'
  return `${n} ${unit}`
})
const daysLabel = computed(() => {
  const n = Number(props.days)
  if (!Number.isFinite(n) || n <= 1) return ''
  const last = n % 10
  const lastTwo = n % 100
  const unit = last === 1 && lastTwo !== 11
    ? 'день'
    : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)
      ? 'дня'
      : 'дней'
  return `${n} ${unit}`
})
</script>

<template>
  <section class="result-wrap rp2-route" aria-label="Описание маршрута">
    <header class="rp2-hero" :class="{ 'rp2-hero--with-photo': !!activeRouteImage }">
      <img
        v-if="activeRouteImage"
        class="rp2-hero-photo"
        :src="activeRouteImage"
        alt=""
        loading="eager"
      >
      <div class="rp2-hero-overlay" aria-hidden="true"></div>

      <div class="rp2-hero-content">
        <div class="rp2-hero-top">
          <div class="rp2-brand-mark">
            <span class="rp2-brand-dot" aria-hidden="true"></span>
            RUSSPLORE <span class="rp2-brand-divider">/</span> МОСКВА
          </div>
          <span v-if="currentGallery.length" class="rp2-photo-count">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 16-5-5-9 9"/>
            </svg>
            {{ currentGallery.length }} фото
          </span>
        </div>

        <div class="rp2-hero-main">
          <span class="rp2-category">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z"/>
            </svg>
            {{ isArt ? 'Творческий маршрут' : 'Исторический маршрут' }}
          </span>
          <h2>{{ displayTitle }}</h2>
          <p v-if="routeAbout || history" class="rp2-hero-description">
            {{ routeAbout || history }}
          </p>
          <div class="rp2-hero-facts" aria-label="Параметры маршрута">
            <span class="rp2-fact">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
              {{ routeDurationName }}
            </span>
            <span v-if="routePointsCount" class="rp2-fact">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              {{ pointsLabel }}
            </span>
            <span class="rp2-fact">
              <svg v-if="mapTravelMode === 'auto'" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14l-1.5-7h-11L5 17Z"/><path d="m7 10 1-4h8l1 4M4 17v2m16-2v2"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/></svg>
              <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2"/><path d="m7 21 3-6 2-3-2-3-3 2-3 4M12 12l4 3 3 1M10 15l4 6"/></svg>
              {{ transportName }}
            </span>
            <span v-if="daysLabel" class="rp2-fact">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>
              {{ daysLabel }}
            </span>
          </div>
        </div>

        <div v-if="currentGallery.length > 1" class="rp2-gallery-control" role="group" aria-label="Выбрать фотографию">
          <button
            v-for="(image, index) in currentGallery"
            :key="index"
            type="button"
            class="rp2-gallery-dot"
            :class="{ 'is-active': activeImageIndex === index }"
            :aria-label="`Показать фото ${index + 1}`"
            :aria-pressed="activeImageIndex === index"
            @click="$emit('select-image', index)"
          ></button>
        </div>
      </div>
    </header>

    <div class="rp2-action-bar">
      <div class="rp2-action-copy">
        <span class="rp2-action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><path d="M9 19h8a4 4 0 0 0 0-8H7a4 4 0 0 1 0-8h8"/><path d="m12 1 3 2-3 2"/></svg>
        </span>
        <div>
          <strong>Ваш маршрут готов</strong>
          <p>Изучите историю и точки прогулки или сохраните описание в PDF.</p>
        </div>
      </div>
      <button
        type="button"
        class="rp2-export-btn"
        :disabled="pdfLoading"
        :aria-busy="pdfLoading"
        @click="$emit('download-pdf')"
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 16v4h16v-4"/>
        </svg>
        {{ pdfLoading ? 'Формируем PDF…' : 'Скачать PDF' }}
      </button>
    </div>

    <div v-if="history || memoryPlaces.length" class="rp2-info-grid">
      <article v-if="history" class="rp2-info-card rp2-story">
        <div class="rp2-section-kicker">О МАРШРУТЕ</div>
        <h3>
          <span class="rp2-heading-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14M12 7C9 5 6 5 3 6v14c3-1 6-1 9 1M12 7c3-2 6-2 9-1v14c-3-1-6-1-9 1"/></svg>
          </span>
          {{ isArt ? 'О локации' : 'История маршрута' }}
        </h3>
        <p class="rp2-story-text">{{ history }}</p>
      </article>

      <article v-if="memoryPlaces.length" class="rp2-info-card rp2-highlights">
        <div class="rp2-section-kicker">ПРОГРАММА</div>
        <h3>
          <span class="rp2-heading-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          </span>
          {{ isArt ? 'Что будем рисовать' : 'Главные точки маршрута' }}
        </h3>
        <ol class="rp2-place-list">
          <li v-for="(item, index) in memoryPlaces" :key="index">
            <span class="rp2-place-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span>{{ item }}</span>
          </li>
        </ol>
      </article>
    </div>

    <section v-if="pleinairs.length" class="rp2-section">
      <div class="rp2-section-heading">
        <span class="rp2-section-kicker">ТВОРЧЕСКИЕ ОСТАНОВКИ</span>
        <h3>Пленэры по маршруту</h3>
        <p>Точки для вдохновения, практики и знакомства с городом.</p>
      </div>
      <div class="rp2-pleinair-grid">
        <article v-for="(item, index) in pleinairs" :key="index" class="rp2-pleinair-card">
          <span class="rp2-pleinair-number">ПЛЕНЭР {{ String(index + 1).padStart(2, '0') }}</span>
          <h4>{{ item.place || `Остановка ${index + 1}` }}</h4>
          <p v-if="item.history" class="rp2-pleinair-description">{{ item.history }}</p>
          <div v-if="item.draw?.length" class="rp2-pleinair-draw">
            <strong>Что рисуем</strong>
            <ul><li v-for="(draw, drawIndex) in item.draw" :key="drawIndex">{{ draw }}</li></ul>
          </div>
          <dl class="rp2-pleinair-facts">
            <div v-if="item.skill"><dt>Навык</dt><dd>{{ item.skill }}</dd></div>
            <div v-if="item.bestTime"><dt>Лучшее время</dt><dd>{{ item.bestTime }}</dd></div>
            <div v-if="item.duration"><dt>Продолжительность</dt><dd>{{ item.duration }}</dd></div>
            <div v-if="item.tip"><dt>Совет</dt><dd>{{ item.tip }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section v-if="showGeneratedText && formattedResult" class="rp2-generated">
      <div class="rp2-section-heading">
        <span class="rp2-section-kicker">ПЕРСОНАЛЬНЫЙ МАРШРУТ</span>
        <h3>Подробный план путешествия</h3>
        <p>План, рекомендации и детали, подготовленные для выбранного формата.</p>
      </div>
      <div class="rp2-generated-html" v-html="formattedResult"></div>
    </section>
  </section>
</template>

<style scoped>
/* Russplore 2.0: все стили изолированы внутри RouteResult.vue. */
.result-wrap.rp2-route {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: min(100%, 1220px);
  margin: 20px auto 22px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: #193347;
}
.rp2-route :is(button) { font-family: inherit; }
.rp2-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: clamp(390px, 41vw, 520px);
  overflow: hidden;
  border-radius: 24px;
  background: radial-gradient(circle at 83% 18%, #398b83 0, transparent 33%), linear-gradient(135deg, #163e4b 0%, #116d6a 100%);
  color: white;
  box-shadow: 0 14px 36px rgba(19, 56, 65, .12);
}
.rp2-hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: -2; }
.rp2-hero-overlay { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(9, 29, 39, .78) 0%, rgba(10, 32, 42, .45) 52%, rgba(10, 32, 42, .12) 100%), linear-gradient(0deg, rgba(5, 26, 32, .75) 0%, transparent 65%); }
.rp2-hero:not(.rp2-hero--with-photo) .rp2-hero-overlay { background: linear-gradient(115deg, rgba(10, 39, 54, .48), rgba(10, 80, 76, .15)); }
.rp2-hero-content { display: flex; flex-direction: column; width: 100%; min-width: 0; padding: clamp(23px, 3.6vw, 43px); }
.rp2-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.rp2-brand-mark { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: .12em; color: rgba(255, 255, 255, .90); }
.rp2-brand-dot { width: 8px; height: 8px; flex: 0 0 8px; border-radius: 50%; background: #79e5c7; box-shadow: 0 0 0 4px rgba(121, 229, 199, .17); }
.rp2-brand-divider { opacity: .5; font-weight: 400; }
.rp2-photo-count { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; border-radius: 100px; padding: 7px 10px; color: #fff; background: rgba(14, 38, 48, .36); border: 1px solid rgba(255,255,255,.2); font-size: 11px; backdrop-filter: blur(8px); }
.rp2-hero-main { margin-top: auto; padding-top: 64px; max-width: 840px; }
.rp2-category { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border: 1px solid rgba(255,255,255,.26); border-radius: 50px; color: #f2fffc; background: rgba(255,255,255,.12); font-size: 11px; font-weight: 700; backdrop-filter: blur(8px); }
.rp2-hero h2 { max-width: 780px; margin: 17px 0 13px; color: #fff; font-size: clamp(30px, 4.2vw, 53px); font-weight: 800; letter-spacing: -.044em; line-height: 1.13; overflow-wrap: anywhere; }
.rp2-hero-description { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; max-width: 670px; margin: 0 0 20px; color: rgba(255,255,255,.88); font-size: 13px; line-height: 1.7; }
.rp2-hero-facts { display: flex; flex-wrap: wrap; gap: 9px; }
.rp2-fact { display: inline-flex; align-items: center; justify-content: flex-start; gap: 8px; max-width: 100%; padding: 9px 12px; border: 1px solid rgba(255,255,255,.21); border-radius: 10px; background: rgba(12, 41, 48, .41); backdrop-filter: blur(7px); color: #fff; font-size: 12px; font-weight: 700; }
.rp2-fact svg { flex: 0 0 auto; color: #a2ead7; }
.rp2-gallery-control { display: flex; align-items: center; gap: 6px; margin-top: 18px; }
.rp2-gallery-dot { width: 23px; height: 6px; padding: 0; border: 0; border-radius: 6px; background: rgba(255,255,255,.43); transition: background .2s, width .2s; }
.rp2-gallery-dot.is-active { width: 41px; background: #fff; }
.rp2-gallery-dot:hover { background: #fff; }
.rp2-gallery-dot:focus-visible { outline: 3px solid #a2ead7; outline-offset: 4px; }
.rp2-action-bar { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 19px 22px; border: 1px solid #e0e9ed; border-radius: 18px; background: #fff; box-shadow: 0 6px 22px rgba(20,52,67,.035); }
.rp2-action-copy { display: flex; align-items: center; gap: 13px; min-width: 0; }
.rp2-action-icon { display: grid; flex: 0 0 46px; place-items: center; width: 46px; height: 46px; border-radius: 12px; color: #078b7c; background: #e7f5f1; }
.rp2-action-copy strong { display: block; font-size: 14px; font-weight: 800; color: #193347; }
.rp2-action-copy p { margin: 4px 0 0; color: #667c8b; font-size: 12px; line-height: 1.5; }
.rp2-export-btn { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; gap: 9px; min-height: 44px; width: auto; margin: 0; padding: 11px 18px; border: 1px solid #078b7c; border-radius: 11px; background: #078b7c; color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer; }
.rp2-export-btn:hover:not(:disabled) { background: #056e64; }
.rp2-export-btn:disabled { opacity: .6; cursor: wait; }
.rp2-info-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, .75fr); align-items: start; gap: 18px; }
.rp2-info-grid > :only-child { grid-column: 1 / -1; }
.rp2-info-card, .rp2-pleinair-card, .rp2-generated { min-width: 0; padding: 25px; border: 1px solid #e0e9ed; border-radius: 19px; background: #fff; box-shadow: 0 7px 25px rgba(20, 52, 67, .035); }
.rp2-section-kicker { display: block; color: #078b7c; font-size: 10px; font-weight: 800; letter-spacing: .13em; }
.rp2-info-card h3 { display: flex; align-items: center; gap: 11px; margin: 12px 0 18px; color: #193347; font-size: clamp(19px, 2vw, 23px); line-height: 1.3; }
.rp2-heading-icon { display: grid; flex: 0 0 38px; place-items: center; width: 38px; height: 38px; border-radius: 11px; color: #078b7c; background: #eaf7f3; }
.rp2-story-text { margin: 0; white-space: pre-line; overflow-wrap: anywhere; color: #4e6979; font-size: 13px; line-height: 1.95; }
.rp2-place-list { display: flex; flex-direction: column; gap: 0; margin: 0; padding: 0; list-style: none; }
.rp2-place-list li { display: flex; align-items: baseline; gap: 13px; padding: 12px 0; border-bottom: 1px solid #edf2f4; color: #345363; font-size: 13px; font-weight: 600; line-height: 1.5; }
.rp2-place-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.rp2-place-index { flex: 0 0 24px; color: #078b7c; font-size: 11px; font-weight: 800; font-variant-numeric: tabular-nums; }
.rp2-section { display: flex; flex-direction: column; gap: 16px; }
.rp2-section-heading { padding: 6px 2px 0; }
.rp2-section-heading h3 { margin: 7px 0; color: #193347; font-size: clamp(22px, 2.6vw, 28px); }
.rp2-section-heading p { margin: 0; color: #667c8b; font-size: 13px; }
.rp2-pleinair-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.rp2-pleinair-number { display: inline-flex; padding: 6px 9px; border-radius: 8px; background: #eaf7f3; color: #078b7c; font-size: 10px; font-weight: 800; letter-spacing: .07em; }
.rp2-pleinair-card h4 { margin: 14px 0 9px; color: #193347; font-size: 19px; }
.rp2-pleinair-description { margin: 0 0 16px; color: #58717e; font-size: 13px; line-height: 1.7; }
.rp2-pleinair-draw { padding: 14px; border-radius: 12px; background: #f2f8f7; }
.rp2-pleinair-draw strong { color: #254857; font-size: 12px; }
.rp2-pleinair-draw ul { margin: 8px 0 0; padding-left: 18px; color: #55707e; font-size: 12px; line-height: 1.75; }
.rp2-pleinair-facts { display: flex; flex-direction: column; gap: 11px; margin: 18px 0 0; }
.rp2-pleinair-facts div { display: grid; grid-template-columns: 135px minmax(0, 1fr); gap: 12px; }
.rp2-pleinair-facts dt { color: #7a8e9a; font-size: 11px; }
.rp2-pleinair-facts dd { margin: 0; color: #294a5a; font-size: 12px; font-weight: 600; overflow-wrap: anywhere; }
.rp2-generated { display: flex; flex-direction: column; gap: 20px; }
.rp2-generated .rp2-section-heading { padding: 0 0 17px; border-bottom: 1px solid #edf2f4; }
.rp2-generated-html { color: #456273; font-size: 13px; line-height: 1.85; overflow-wrap: anywhere; }
.rp2-generated-html :deep(h2), .rp2-generated-html :deep(h3) { margin: 24px 0 10px; color: #193347; line-height: 1.3; }
.rp2-generated-html :deep(p) { margin: 9px 0; }
.rp2-generated-html :deep(ul), .rp2-generated-html :deep(ol) { padding-left: 23px; }
.rp2-generated-html :deep(img) { max-width: 100%; height: auto; border-radius: 12px; }
.rp2-generated-html :deep(table) { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
.rp2-generated-html :deep(th), .rp2-generated-html :deep(td) { padding: 9px 12px; border: 1px solid #dfe8ec; }
@media (max-width: 900px) {
  .rp2-info-grid { grid-template-columns: 1fr; }
  .rp2-info-grid > :only-child { grid-column: auto; }
}
@media (max-width: 650px) {
  .result-wrap.rp2-route { gap: 14px; margin-top: 12px; }
  .rp2-hero { min-height: 440px; border-radius: 17px; }
  .rp2-hero-content { padding: 23px 19px; }
  .rp2-brand-mark { font-size: 9px; letter-spacing: .08em; }
  .rp2-hero-main { padding-top: 52px; }
  .rp2-hero h2 { font-size: clamp(29px, 8vw, 38px); }
  .rp2-hero-description { -webkit-line-clamp: 3; font-size: 12px; }
  .rp2-hero-facts { gap: 6px; }
  .rp2-fact { padding: 7px 9px; font-size: 11px; }
  .rp2-action-bar { flex-direction: column; align-items: stretch; gap: 16px; padding: 17px; }
  .rp2-export-btn { width: 100%; }
  .rp2-info-card, .rp2-pleinair-card, .rp2-generated { padding: 20px; border-radius: 16px; }
  .rp2-pleinair-grid { grid-template-columns: 1fr; }
  .rp2-pleinair-facts div { grid-template-columns: 100px minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) { .rp2-gallery-dot { transition: none; } }
</style>
