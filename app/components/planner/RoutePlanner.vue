<script setup>
const props = defineProps({
  routeMode: { type: String, required: true },
  place: { type: String, default: '' },
  routeDuration: { type: String, required: true },
  days: { type: [String, Number], default: '' },
  budget: { type: [String, Number], default: '' },
  cityGroups: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'close',
  'update:route-mode',
  'update:place',
  'update:route-duration',
  'update:days',
  'update:budget',
  'generate'
])

// Сохраняем прежнее поведение: смена темы сбрасывает выбранный город.
function selectMode(mode) {
  emit('update:route-mode', mode)
  emit('update:place', '')
}

// Значения short/day/long и количество дней ожидаются существующим генератором.
function selectDuration(duration, days) {
  emit('update:route-duration', duration)
  emit('update:days', days)
}
</script>

<template>
  <transition name="rp-planner-appear">
    <section class="rp-planner" aria-labelledby="rp-planner-title">
      <header class="rp-planner__header">
        <div class="rp-planner__header-copy">
          <span class="rp-planner__eyebrow">
            <svg class="rp-planner__svg rp-planner__svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m3 17 6-6 4 4 8-8" />
              <path d="M16 7h5v5" />
            </svg>
            ПЕРСОНАЛЬНЫЙ МАРШРУТ
          </span>
          <h2 id="rp-planner-title">{{ routeMode === 'moscowArt' ? 'Создайте творческий маршрут' : 'Спланируйте путешествие' }}</h2>
          <p>Выберите направление, город и продолжительность. Мы подготовим маршрут с учётом ваших пожеланий.</p>
        </div>
        <button class="rp-planner__close" type="button" aria-label="Закрыть планировщик" title="Закрыть" @click="$emit('close')">
          <svg class="rp-planner__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="rp-planner__content">
        <section class="rp-planner__group" aria-labelledby="rp-planner-type-title">
          <div class="rp-planner__group-head">
            <span class="rp-planner__step">01</span>
            <div>
              <h3 id="rp-planner-type-title">Выберите направление</h3>
              <p>Какую сторону города хотите открыть?</p>
            </div>
          </div>
          <div class="rp-planner__modes" role="group" aria-label="Направление маршрута">
            <button
              type="button"
              class="rp-planner__mode"
              :class="{ 'rp-planner__mode--active': routeMode === 'history' }"
              :aria-pressed="routeMode === 'history'"
              @click="selectMode('history')"
            >
              <span class="rp-planner__mode-icon">
                <svg class="rp-planner__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 6.5c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z" />
                  <path d="M12 6.5v13" />
                </svg>
              </span>
              <span class="rp-planner__mode-text">
                <strong>Военная история</strong>
                <small>Памятные места и исторические события</small>
              </span>
              <span class="rp-planner__check" aria-hidden="true">
                <svg class="rp-planner__svg rp-planner__svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              class="rp-planner__mode"
              :class="{ 'rp-planner__mode--active': routeMode === 'moscowArt' }"
              :aria-pressed="routeMode === 'moscowArt'"
              @click="selectMode('moscowArt')"
            >
              <span class="rp-planner__mode-icon rp-planner__mode-icon--art">
                <svg class="rp-planner__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" />
                  <circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" />
                </svg>
              </span>
              <span class="rp-planner__mode-text">
                <strong>Москва в красках</strong>
                <small>Искусство, вдохновение и пленэры</small>
              </span>
              <span class="rp-planner__check" aria-hidden="true">
                <svg class="rp-planner__svg rp-planner__svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
            </button>
          </div>
        </section>

        <section class="rp-planner__group" aria-labelledby="rp-planner-city-title">
          <div class="rp-planner__group-head">
            <span class="rp-planner__step">02</span>
            <div>
              <h3 id="rp-planner-city-title">Куда отправимся?</h3>
              <p>{{ place ? `Выбрано: ${place}` : 'Выберите город или направление из списка' }}</p>
            </div>
          </div>
          <div class="rp-planner__cities">
            <div v-for="group in cityGroups" :key="group.group" class="rp-planner__city-group">
              <h4>{{ group.group }}</h4>
              <div class="rp-planner__city-grid" role="group" :aria-label="group.group">
                <button
                  v-for="city in group.items"
                  :key="city"
                  type="button"
                  class="rp-planner__city"
                  :class="{ 'rp-planner__city--active': place === city }"
                  :aria-pressed="place === city"
                  @click="$emit('update:place', city)"
                >
                  <svg v-if="place === city" class="rp-planner__svg rp-planner__svg--tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  {{ city }}
                </button>
              </div>
            </div>
            <p v-if="!cityGroups.length" class="rp-planner__empty">Список направлений пока недоступен.</p>
          </div>
        </section>

        <section class="rp-planner__group" aria-labelledby="rp-planner-duration-title">
          <div class="rp-planner__group-head">
            <span class="rp-planner__step">03</span>
            <div>
              <h3 id="rp-planner-duration-title">Сколько времени есть?</h3>
              <p>Подберём подходящую продолжительность прогулки</p>
            </div>
          </div>
          <div class="rp-planner__durations" role="group" aria-label="Продолжительность маршрута">
            <button type="button" class="rp-planner__duration" :class="{ 'rp-planner__duration--active': routeDuration === 'short' }" :aria-pressed="routeDuration === 'short'" @click="selectDuration('short', '1')">
              <span class="rp-planner__duration-icon">
                <svg class="rp-planner__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
              </span>
              <strong>Короткий</strong>
              <small>2–3 часа</small>
            </button>
            <button type="button" class="rp-planner__duration" :class="{ 'rp-planner__duration--active': routeDuration === 'day' }" :aria-pressed="routeDuration === 'day'" @click="selectDuration('day', '1')">
              <span class="rp-planner__duration-icon">
                <svg class="rp-planner__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              </span>
              <strong>На день</strong>
              <small>6–8 часов</small>
            </button>
            <button type="button" class="rp-planner__duration" :class="{ 'rp-planner__duration--active': routeDuration === 'long' }" :aria-pressed="routeDuration === 'long'" @click="selectDuration('long', '3')">
              <span class="rp-planner__duration-icon">
                <svg class="rp-planner__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" />
                </svg>
              </span>
              <strong>Несколько дней</strong>
              <small>2–3 дня</small>
            </button>
          </div>
        </section>

        <section class="rp-planner__group rp-planner__group--budget" aria-labelledby="rp-planner-budget-title">
          <div class="rp-planner__group-head">
            <span class="rp-planner__step">04</span>
            <div>
              <h3 id="rp-planner-budget-title">Бюджет путешествия</h3>
              <p>{{ routeMode === 'moscowArt' ? 'При необходимости укажите бюджет на материалы' : 'Необязательно — можно оставить поле пустым' }}</p>
            </div>
          </div>
          <div class="rp-planner__budget-field">
            <label for="rp-planner-budget-input">Бюджет, ₽</label>
            <div class="rp-planner__budget-control">
              <input
                id="rp-planner-budget-input"
                :value="budget"
                type="number"
                min="0"
                step="100"
                inputmode="numeric"
                placeholder="Например, 5000"
                @input="$emit('update:budget', $event.target.value)"
              >
              <span aria-hidden="true">₽</span>
            </div>
          </div>
        </section>

        <footer class="rp-planner__footer">
          <div class="rp-planner__footer-copy">
            <span class="rp-planner__footer-check" aria-hidden="true">
              <svg class="rp-planner__svg rp-planner__svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <span><strong>Ваш маршрут — под ваши планы</strong><small>Параметры можно изменить перед созданием</small></span>
          </div>
          <button class="rp-planner__submit" type="button" @click="$emit('generate')">
            {{ routeMode === 'moscowArt' ? 'Создать маршрут пленэра' : 'Сгенерировать маршрут' }}
            <svg class="rp-planner__svg rp-planner__svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </button>
        </footer>
      </div>
    </section>
  </transition>
</template>

<style scoped>
.rp-planner {
  --rp-green: #078b7c;
  --rp-deep-green: #056e64;
  --rp-ink: #193347;
  --rp-muted: #6d8190;
  --rp-line: #e1eaed;
  width: min(100%, 980px);
  margin: 20px auto 28px;
  overflow: hidden;
  border: 1px solid var(--rp-line);
  border-radius: 24px;
  background: #fff;
  color: var(--rp-ink);
  box-shadow: 0 16px 45px rgba(25, 51, 71, .06);
}
.rp-planner, .rp-planner * { box-sizing: border-box; }
.rp-planner button, .rp-planner input { font: inherit; }
.rp-planner button { margin: 0; cursor: pointer; }
.rp-planner button:focus-visible, .rp-planner input:focus-visible { outline: 3px solid #75d7c8; outline-offset: 2px; }
.rp-planner .rp-planner__svg { display: inline-block; width: 21px; height: 21px; flex: 0 0 21px; vertical-align: middle; }
.rp-planner .rp-planner__svg--sm { width: 17px; height: 17px; flex-basis: 17px; }
.rp-planner .rp-planner__svg--tiny { width: 13px; height: 13px; flex-basis: 13px; }
.rp-planner__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 33px 36px 31px; background: linear-gradient(116deg, #ebf7f4 0%, #f7fbfa 60%, #fff 100%); border-bottom: 1px solid #e0eeea; }
.rp-planner__header-copy { min-width: 0; }
.rp-planner__eyebrow { display: inline-flex; align-items: center; gap: 8px; color: var(--rp-green); font-size: 10px; font-weight: 800; letter-spacing: .09em; }
.rp-planner__header h2 { margin: 13px 0 9px; color: var(--rp-ink); font-size: clamp(25px, 3vw, 34px); font-weight: 800; letter-spacing: -.035em; line-height: 1.2; }
.rp-planner__header p { max-width: 680px; margin: 0; color: #657d89; font-size: 13px; line-height: 1.75; }
.rp-planner__close { display: grid; place-items: center; flex: 0 0 38px; width: 38px; height: 38px; padding: 0; border: 1px solid #d9e9e4; border-radius: 11px; background: #fff; color: #627987; }
.rp-planner__close:hover { background: #eaf5f1; color: var(--rp-green); }
.rp-planner__content { padding: 29px 36px 35px; }
.rp-planner__group + .rp-planner__group { margin-top: 31px; padding-top: 29px; border-top: 1px solid #edf1f3; }
.rp-planner__group-head { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 17px; }
.rp-planner__step { display: grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border-radius: 9px; background: #e6f5f1; color: var(--rp-green); font-size: 11px; font-weight: 800; }
.rp-planner__group-head h3 { margin: 0 0 4px; color: var(--rp-ink); font-size: 16px; font-weight: 800; letter-spacing: -.02em; }
.rp-planner__group-head p { margin: 0; color: var(--rp-muted); font-size: 11px; line-height: 1.6; }
.rp-planner__modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
.rp-planner__mode { display: flex; align-items: center; gap: 12px; min-width: 0; min-height: 87px; width: 100%; padding: 15px; border: 1px solid var(--rp-line); border-radius: 14px; background: #fff; color: var(--rp-ink); text-align: left; transition: border-color .18s ease, background .18s ease, box-shadow .18s ease; }
.rp-planner__mode:hover { border-color: #91cfc5; }
.rp-planner__mode--active { border-color: #79c9bb; background: #f0faf6; box-shadow: 0 0 0 1px rgba(7, 139, 124, .06); }
.rp-planner__mode-icon { display: grid; place-items: center; flex: 0 0 43px; width: 43px; height: 43px; border-radius: 12px; background: #e7f5f1; color: var(--rp-green); }
.rp-planner__mode-icon--art { background: #faf1e5; color: #c58a24; }
.rp-planner__mode-text { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.rp-planner__mode-text strong { font-size: 13px; font-weight: 800; }
.rp-planner__mode-text small { color: var(--rp-muted); font-size: 10px; line-height: 1.55; }
.rp-planner__check { display: grid; place-items: center; flex: 0 0 23px; width: 23px; height: 23px; border: 1px solid #cedcde; border-radius: 50%; background: #fff; color: transparent; }
.rp-planner__mode--active .rp-planner__check { border-color: var(--rp-green); background: var(--rp-green); color: #fff; }
.rp-planner__cities { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
.rp-planner__city-group { min-width: 0; padding: 16px; border: 1px solid var(--rp-line); border-radius: 13px; background: #fbfdfd; }
.rp-planner__city-group h4 { margin: 0 0 12px; color: #415d6c; font-size: 11px; font-weight: 800; }
.rp-planner__city-grid { display: flex; flex-wrap: wrap; gap: 7px; }
.rp-planner__city { display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: auto; min-height: 33px; padding: 6px 11px; border: 1px solid #dfebec; border-radius: 8px; background: #fff; color: #476172; font-size: 11px; font-weight: 700; text-align: center; }
.rp-planner__city:hover { border-color: #95cfc3; color: var(--rp-deep-green); }
.rp-planner__city--active { border-color: #80c6b9; background: #e6f6f0; color: var(--rp-deep-green); }
.rp-planner__empty { grid-column: 1/-1; padding: 15px; border: 1px dashed #b8d3cf; border-radius: 11px; color: var(--rp-muted); font-size: 12px; }
.rp-planner__durations { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11px; }
.rp-planner__duration { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; width: 100%; min-height: 122px; padding: 16px; border: 1px solid var(--rp-line); border-radius: 13px; background: #fff; color: var(--rp-ink); text-align: left; }
.rp-planner__duration:hover { border-color: #8bcec3; }
.rp-planner__duration--active { border-color: #75c6b7; background: #f0faf6; box-shadow: inset 0 0 0 1px rgba(7, 139, 124, .07); }
.rp-planner__duration-icon { display: grid; place-items: center; width: 31px; height: 31px; margin-bottom: 4px; color: var(--rp-green); }
.rp-planner__duration strong { font-size: 13px; font-weight: 800; }
.rp-planner__duration small { color: var(--rp-muted); font-size: 11px; }
.rp-planner__budget-field { max-width: 320px; }
.rp-planner__budget-field label { display: block; margin-bottom: 8px; color: #405b6b; font-size: 11px; font-weight: 800; }
.rp-planner__budget-control { position: relative; }
.rp-planner__budget-control input { display: block; width: 100%; min-height: 46px; padding: 12px 42px 12px 14px; border: 1px solid #dae5e8; border-radius: 11px; background: #fff; color: var(--rp-ink); font-size: 13px; }
.rp-planner__budget-control input:focus { outline: none; border-color: #7ac6b6; box-shadow: 0 0 0 3px rgba(7, 139, 124, .09); }
.rp-planner__budget-control > span { position: absolute; top: 50%; right: 15px; transform: translateY(-50%); color: var(--rp-green); font-weight: 800; pointer-events: none; }
.rp-planner__footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 29px; padding: 22px; border: 1px solid #dcefe8; border-radius: 15px; background: #f1f9f6; }
.rp-planner__footer-copy { display: flex; align-items: center; gap: 11px; min-width: 0; }
.rp-planner__footer-check { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; border-radius: 10px; background: #d7f0e6; color: var(--rp-green); }
.rp-planner__footer-copy > span:last-child { display: flex; flex-direction: column; gap: 3px; }
.rp-planner__footer-copy strong { font-size: 12px; font-weight: 800; }
.rp-planner__footer-copy small { color: var(--rp-muted); font-size: 10px; }
.rp-planner__submit { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: auto; min-height: 44px; padding: 12px 17px; border: 1px solid var(--rp-green); border-radius: 10px; background: var(--rp-green); color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap; }
.rp-planner__submit:hover { border-color: var(--rp-deep-green); background: var(--rp-deep-green); }
.rp-planner-appear-enter-active, .rp-planner-appear-leave-active { transition: opacity .2s ease, transform .2s ease; }
.rp-planner-appear-enter-from, .rp-planner-appear-leave-to { opacity: 0; transform: translateY(10px); }
@media (max-width: 760px) {
  .rp-planner { margin: 12px auto 24px; border-radius: 18px; }
  .rp-planner__header { padding: 24px 21px; }
  .rp-planner__content { padding: 22px 19px 24px; }
  .rp-planner__cities { grid-template-columns: 1fr; }
  .rp-planner__footer { flex-direction: column; align-items: stretch; padding: 17px; }
  .rp-planner__submit { width: 100%; }
}
@media (max-width: 520px) {
  .rp-planner__header { gap: 10px; padding: 21px 18px; }
  .rp-planner__header h2 { font-size: 26px; }
  .rp-planner__content { padding: 20px 15px 24px; }
  .rp-planner__modes { grid-template-columns: 1fr; }
  .rp-planner__mode { min-height: 73px; }
  .rp-planner__durations { gap: 7px; }
  .rp-planner__duration { min-height: 115px; padding: 10px; }
  .rp-planner__duration strong { font-size: 11px; }
  .rp-planner__duration small { font-size: 10px; }
  .rp-planner__group + .rp-planner__group { margin-top: 24px; padding-top: 23px; }
}
@media (prefers-reduced-motion: reduce) { .rp-planner-appear-enter-active, .rp-planner-appear-leave-active { transition: none; } }
</style>
