<script setup>
import { computed } from 'vue'

// Контракт с app.vue сохранён: те же четыре входных параметра и два события.
const props = defineProps({
  routeStops: { type: Array, default: () => [] },
  visitedStopIds: { type: Array, default: () => [] },
  routeProgressPercent: { type: Number, default: 0 },
  routeDurationName: { type: String, default: '—' }
})

const emit = defineEmits(['start-route', 'open-stop'])

function isStopVisited(stopId) {
  return props.visitedStopIds.includes(stopId)
}

const visitedCount = computed(() =>
  props.routeStops.filter((stop) => isStopVisited(stop.id)).length
)
const totalCount = computed(() => props.routeStops.length)
const completed = computed(() => totalCount.value > 0 && visitedCount.value >= totalCount.value)
const nextStopId = computed(() =>
  props.routeStops.find((stop) => !isStopVisited(stop.id))?.id ?? null
)
const progressPercent = computed(() => {
  const value = Number(props.routeProgressPercent)
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
})

function openStop(stop) {
  emit('open-stop', stop)
}
</script>

<template>
  <section class="route-stops-section rp2s" aria-labelledby="rp2s-title">
    <div class="rp2s-overview">
      <div class="rp2s-overview-main">
        <div class="rp2s-kicker">
          <span class="rp2s-kicker-dot" aria-hidden="true"></span>
          ИНТЕРАКТИВНЫЙ МАРШРУТ
        </div>

        <h2 id="rp2s-title">Пройдите маршрут в своём темпе</h2>
        <p class="rp2s-lead">
          Открывайте достопримечательности по порядку, слушайте аудиогид
          и отмечайте места, в которых уже побывали.
        </p>

        <div class="rp2s-quick-facts" aria-label="Информация о маршруте">
          <span>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            {{ routeDurationName }}
          </span>
          <span>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            {{ totalCount }} {{ totalCount === 1 ? 'точка' : totalCount >= 2 && totalCount <= 4 ? 'точки' : 'точек' }}
          </span>
        </div>
      </div>

      <div class="rp2s-action-pane">
        <div class="rp2s-counter"><strong>{{ visitedCount }}</strong><span> / {{ totalCount }}</span></div>
        <div class="rp2s-counter-caption">точек пройдено</div>
        <button
          v-if="!completed"
          type="button"
          class="rp2s-start-btn"
          :disabled="!totalCount"
          @click="$emit('start-route')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>
          {{ visitedCount ? 'Продолжить маршрут' : 'Начать маршрут' }}
        </button>
        <div v-else class="rp2s-finished">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>
          Маршрут пройден
        </div>
      </div>
    </div>

    <div class="rp2s-progress-panel">
      <div class="rp2s-progress-caption">
        <span>Прогресс прогулки</span>
        <strong>{{ progressPercent }}%</strong>
      </div>
      <div
        class="rp2s-progress-track"
        role="progressbar"
        :aria-valuenow="progressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Прогресс прохождения маршрута"
      >
        <div class="rp2s-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <p class="rp2s-progress-hint">Отметить посещение можно в карточке каждой точки.</p>
    </div>

    <div class="rp2s-benefits" aria-label="Возможности во время прогулки">
      <div class="rp2s-benefit">
        <span class="rp2s-benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>
        </span>
        <span><strong>Карта</strong><small>Порядок остановок</small></span>
      </div>
      <div class="rp2s-benefit">
        <span class="rp2s-benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14M12 7C9 5 6 5 3 6v14c3-1 6-1 9 1M12 7c3-2 6-2 9-1v14c-3-1-6-1-9 1"/></svg>
        </span>
        <span><strong>История</strong><small>Факты о местах</small></span>
      </div>
      <div class="rp2s-benefit">
        <span class="rp2s-benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/></svg>
        </span>
        <span><strong>Аудиогид</strong><small>Рассказы об объектах</small></span>
      </div>
      <div class="rp2s-benefit">
        <span class="rp2s-benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>
        </span>
        <span><strong>Прогресс</strong><small>Посещённые точки</small></span>
      </div>
    </div>

    <div class="rp2s-section-heading">
      <div>
        <span class="rp2s-section-label">ВАШ ПУТЕВОДИТЕЛЬ</span>
        <h2>Остановки маршрута</h2>
        <p>Нажмите на место, чтобы открыть подробности, аудиогид и задание.</p>
      </div>
      <span class="rp2s-stops-total">{{ totalCount }} {{ totalCount === 1 ? 'остановка' : totalCount >= 2 && totalCount <= 4 ? 'остановки' : 'остановок' }}</span>
    </div>

    <div class="rp2s-grid">
      <button
        v-for="(stop, index) in routeStops"
        :key="stop.id ?? index"
        type="button"
        class="rp2s-stop"
        :class="{ 'is-visited': isStopVisited(stop.id), 'is-next': nextStopId === stop.id && !completed }"
        :aria-label="`${stop.name || `Остановка ${index + 1}`}. ${isStopVisited(stop.id) ? 'Посещено' : 'Открыть точку маршрута'}`"
        @click="openStop(stop)"
      >
        <span class="rp2s-stop-marker" :class="{ 'is-visited': isStopVisited(stop.id) }" aria-hidden="true">
          <svg v-if="isStopVisited(stop.id)" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
          <template v-else>{{ String(stop.number || index + 1).padStart(2, '0') }}</template>
        </span>
        <span class="rp2s-stop-body">
          <span class="rp2s-stop-meta">
            <span v-if="stop.day" class="rp2s-stop-day">ДЕНЬ {{ stop.day }}</span>
            <span v-if="isStopVisited(stop.id)" class="rp2s-stop-status is-done">Посещено</span>
            <span v-else-if="nextStopId === stop.id" class="rp2s-stop-status is-up-next">Следующая точка</span>
            <span v-else class="rp2s-stop-status">Остановка {{ stop.number || index + 1 }}</span>
          </span>
          <strong class="rp2s-stop-title">{{ stop.name || `Остановка ${index + 1}` }}</strong>
          <span v-if="stop.description" class="rp2s-stop-description">{{ stop.description }}</span>
          <span class="rp2s-stop-open">
            Подробнее о месте
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
          </span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
/* Russplore 2.0 — автономный дизайн точек маршрута; общий CSS и компоненты карты не изменяются. */
.route-stops-section.rp2s {
  --rp2s-ink: #193347;
  --rp2s-muted: #667c8b;
  --rp2s-green: #078b7c;
  --rp2s-line: #e0e9ed;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: min(100%, 1220px);
  margin: 0 auto 28px;
  color: var(--rp2s-ink);
}
.rp2s button { font: inherit; }
.rp2s-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  align-items: center;
  gap: clamp(18px, 3vw, 38px);
  padding: clamp(24px, 3vw, 35px);
  border: 1px solid #dcebe7;
  border-radius: 21px;
  background: linear-gradient(115deg, #ffffff 0%, #ffffff 55%, #eff8f5 100%);
  box-shadow: 0 8px 26px rgba(20, 52, 67, .035);
}
.rp2s-kicker { display: inline-flex; align-items: center; gap: 10px; color: var(--rp2s-green); font-size: 10px; font-weight: 800; letter-spacing: .13em; }
.rp2s-kicker-dot { flex: 0 0 7px; width: 7px; height: 7px; background: #19b7a0; border-radius: 50%; box-shadow: 0 0 0 4px #e3f6ef; }
.rp2s-overview h2 { margin: 13px 0 12px; max-width: 620px; color: var(--rp2s-ink); font-size: clamp(24px, 2.7vw, 33px); font-weight: 800; letter-spacing: -.036em; line-height: 1.2; }
.rp2s-lead { max-width: 610px; margin: 0; color: var(--rp2s-muted); font-size: 13px; line-height: 1.75; }
.rp2s-quick-facts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.rp2s-quick-facts > span { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid #e5efed; border-radius: 9px; background: white; color: #4b6e76; font-size: 11px; font-weight: 700; }
.rp2s-quick-facts svg { color: var(--rp2s-green); }
.rp2s-action-pane { display: flex; flex-direction: column; align-items: stretch; min-width: 0; padding: 20px; border: 1px solid #dbece7; border-radius: 16px; background: #f4faf7; text-align: center; }
.rp2s-counter { color: var(--rp2s-ink); font-size: 23px; font-weight: 600; font-variant-numeric: tabular-nums; }
.rp2s-counter strong { color: var(--rp2s-green); font-size: 39px; font-weight: 800; letter-spacing: -.04em; }
.rp2s-counter span { color: #7b9095; }
.rp2s-counter-caption { margin: -1px 0 18px; color: #66858b; font-size: 11px; }
.rp2s-start-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; width: 100%; min-height: 44px; margin: 0; padding: 11px 14px; border: 1px solid var(--rp2s-green); border-radius: 10px; color: #fff; background: var(--rp2s-green); cursor: pointer; font-size: 12px !important; font-weight: 800 !important; }
.rp2s-start-btn:hover:not(:disabled) { background: #056e64; }
.rp2s-start-btn:disabled { opacity: .5; cursor: not-allowed; }
.rp2s-finished { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px; border-radius: 10px; color: #097960; background: #dff4eb; font-size: 12px; font-weight: 800; }
.rp2s-progress-panel { padding: 19px 23px 17px; border: 1px solid var(--rp2s-line); border-radius: 16px; background: #fff; }
.rp2s-progress-caption { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; color: #526f7c; font-size: 12px; font-weight: 700; }
.rp2s-progress-caption strong { color: var(--rp2s-green); font-size: 14px; font-variant-numeric: tabular-nums; }
.rp2s-progress-track { height: 9px; overflow: hidden; border-radius: 99px; background: #eaf1f2; }
.rp2s-progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #0a9484, #30b49b); transition: width .28s ease; }
.rp2s-progress-hint { margin: 10px 0 0; color: #8396a1; font-size: 11px; }
.rp2s-benefits { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.rp2s-benefit { display: flex; align-items: center; gap: 11px; min-width: 0; min-height: 69px; padding: 12px 14px; border: 1px solid var(--rp2s-line); border-radius: 13px; background: #fff; }
.rp2s-benefit-icon { display: grid; place-items: center; flex: 0 0 38px; width: 38px; height: 38px; border-radius: 10px; background: #eaf7f3; color: var(--rp2s-green); }
.rp2s-benefit strong { display: block; font-size: 12px; font-weight: 800; color: #284a56; }
.rp2s-benefit small { display: block; margin-top: 2px; color: var(--rp2s-muted); font-size: 10px; line-height: 1.4; }
.rp2s-section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 8px 0 0; }
.rp2s-section-label { color: var(--rp2s-green); font-size: 10px; font-weight: 800; letter-spacing: .13em; }
.rp2s-section-heading h2 { margin: 6px 0 7px; color: var(--rp2s-ink); font-size: clamp(23px, 2.6vw, 29px); letter-spacing: -.035em; }
.rp2s-section-heading p { margin: 0; color: var(--rp2s-muted); font-size: 12px; line-height: 1.6; }
.rp2s-stops-total { white-space: nowrap; padding: 8px 12px; border: 1px solid #dcece7; border-radius: 9px; background: #eaf7f3; color: var(--rp2s-green); font-size: 11px; font-weight: 800; }
.rp2s-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.rp2s-stop { display: flex; align-items: flex-start; gap: 17px; width: 100%; min-width: 0; min-height: 182px; margin: 0; padding: 21px; border: 1px solid var(--rp2s-line); border-radius: 16px; background: #fff; color: var(--rp2s-ink); text-align: left; box-shadow: 0 4px 15px rgba(20, 52, 67, .025); cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.rp2s-stop:hover { border-color: #9bcdc2; box-shadow: 0 9px 25px rgba(20,52,67,.07); transform: translateY(-2px); }
.rp2s-stop:focus-visible { outline: 3px solid #74d8c9; outline-offset: 3px; }
.rp2s-stop.is-next { border-color: #a7d8cb; background: linear-gradient(135deg, #fff, #fcfffe); }
.rp2s-stop-marker { display: grid; place-items: center; flex: 0 0 43px; width: 43px; height: 43px; border: 1px solid #dcece7; border-radius: 12px; color: var(--rp2s-green); background: #eaf7f3; font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.rp2s-stop-marker.is-visited { color: #fff; background: var(--rp2s-green); border-color: var(--rp2s-green); }
.rp2s-stop-body { display: flex; flex: 1 1 auto; flex-direction: column; align-items: flex-start; min-width: 0; align-self: stretch; }
.rp2s-stop-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: 19px; }
.rp2s-stop-day, .rp2s-stop-status { color: #7a8d98; font-size: 10px; font-weight: 800; letter-spacing: .035em; }
.rp2s-stop-day { color: #078b7c; }
.rp2s-stop-status.is-up-next { color: #068a76; }
.rp2s-stop-status.is-done { color: #0b9368; }
.rp2s-stop-title { display: block; margin: 8px 0; color: var(--rp2s-ink); font-size: 17px; font-weight: 800; line-height: 1.32; letter-spacing: -.02em; overflow-wrap: anywhere; }
.rp2s-stop-description { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; color: #607988; font-size: 12px; line-height: 1.65; }
.rp2s-stop-open { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 15px; color: var(--rp2s-green); font-size: 11px; font-weight: 800; }
.rp2s-stop-open svg { transition: transform .2s ease; }
.rp2s-stop:hover .rp2s-stop-open svg { transform: translateX(3px); }
@media (max-width: 1000px) { .rp2s-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .rp2s-overview { grid-template-columns: 1fr; gap: 18px; padding: 22px; }
  .rp2s-action-pane { align-items: center; flex-direction: row; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 14px 16px; text-align: left; }
  .rp2s-counter { font-size: 17px; }
  .rp2s-counter strong { font-size: 29px; }
  .rp2s-counter-caption { margin: 0 auto 0 0; }
  .rp2s-start-btn, .rp2s-finished { width: auto; }
  .rp2s-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .rp2s-overview { padding: 20px 17px; }
  .rp2s-overview h2 { font-size: 24px; }
  .rp2s-action-pane { align-items: center; }
  .rp2s-counter-caption { flex-basis: 43%; }
  .rp2s-start-btn, .rp2s-finished { width: 100%; }
  .rp2s-progress-panel { padding: 17px; }
  .rp2s-benefits { gap: 8px; }
  .rp2s-benefit { gap: 8px; padding: 11px; }
  .rp2s-benefit-icon { flex-basis: 32px; width: 32px; height: 32px; }
  .rp2s-benefit small { font-size: 9px; }
  .rp2s-section-heading { align-items: flex-start; flex-direction: column; }
  .rp2s-stop { gap: 12px; padding: 17px; min-height: 160px; }
  .rp2s-stop-marker { flex-basis: 37px; width: 37px; height: 37px; }
  .rp2s-stop-title { font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .rp2s-progress-fill, .rp2s-stop, .rp2s-stop-open svg { transition: none; }
  .rp2s-stop:hover { transform: none; }
}
</style>
