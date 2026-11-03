<script setup>
import { computed, ref } from 'vue'
import AccessibilityPassport from './AccessibilityPassport.vue'

defineEmits(['back'])

// Критерии пользователя — не подтверждения доступности объектов.
const accessOptions = [
  { id: 'stepFree', label: 'Без ступеней', detail: 'Входы и переходы без лестниц' },
  { id: 'wheelchair', label: 'Для кресла-коляски', detail: 'Ширина проходов, уклоны, покрытие' },
  { id: 'rest', label: 'Места для отдыха', detail: 'Скамейки и возможность сделать паузу' },
  { id: 'toilet', label: 'Доступный туалет', detail: 'Подтверждённая доступность санузла' },
  { id: 'parking', label: 'Парковка', detail: 'Специальные парковочные места' },
  { id: 'companion', label: 'Помощь на маршруте', detail: 'Условия сопровождения' },
  { id: 'quiet', label: 'Спокойный темп', detail: 'Небольшие участки и частые остановки' },
  { id: 'family', label: 'Семейная прогулка', detail: 'Условия для разных возрастов' }
]

const selectedNeeds = ref([])
const selectedTheme = ref('all')
const expandedPassportId = ref(null)
const themes = [
  { id: 'all', label: 'Все направления' },
  { id: 'history', label: 'История и память' },
  { id: 'family', label: 'Для всей семьи' },
  { id: 'culture', label: 'Культура и город' }
]

// Кандидаты, не опубликованные в качестве доступных маршрутов.
// После реального обследования сюда можно добавить статусы и факты.
const pilotCandidates = [
  {
    id: 'vdnh',
    number: '01',
    title: 'ВДНХ: прогулка по центральной территории',
    description: 'Первый пилот для оценки покрытия дорожек, мест отдыха, входов и санитарной инфраструктуры.',
    tags: ['family', 'culture'],
    label: 'Городская прогулка',
    check: ['Покрытие и уклоны', 'Входы и переходы', 'Места отдыха и туалеты'],
    // Это план будущего обследования, НЕ подтверждённые свойства маршрута.
    auditFocus: ['stepFree', 'wheelchair', 'rest', 'toilet', 'quiet', 'family']
  },
  {
    id: 'victory-park',
    number: '02',
    title: 'Парк Победы: история и память',
    description: 'Кандидат на исторический маршрут с подробной проверкой пешеходных участков и доступности объектов.',
    tags: ['history', 'family'],
    label: 'История и память',
    check: ['Непрерывность пути', 'Переходы и уклоны', 'Доступность входов'],
    auditFocus: ['stepFree', 'wheelchair', 'rest', 'parking', 'companion', 'family']
  },
  {
    id: 'moscow-center',
    number: '03',
    title: 'Исторический центр Москвы',
    description: 'Будущий маршрут по знаковым городским местам. Точки, длина и условия прохождения определятся после обследования.',
    tags: ['history', 'culture'],
    label: 'История города',
    check: ['Бордюры и переходы', 'Покрытие улиц', 'Доступные точки отдыха'],
    auditFocus: ['stepFree', 'rest', 'toilet', 'quiet', 'companion']
  }
]

// Фильтруем ПРОГРАММУ ОБСЛЕДОВАНИЯ, а не доступность маршрута.
// Для реального подбора путешествий понадобятся подтверждённые полевые данные.
const themeCandidates = computed(() =>
  pilotCandidates.filter((candidate) =>
    selectedTheme.value === 'all' || candidate.tags.includes(selectedTheme.value)
  )
)
const visibleCandidates = computed(() =>
  themeCandidates.value.filter((candidate) =>
    selectedNeeds.value.every((need) => candidate.auditFocus.includes(need))
  )
)
const chosenOptions = computed(() =>
  accessOptions.filter((option) => selectedNeeds.value.includes(option.id))
)
const chosenLabels = computed(() => chosenOptions.value.map((option) => option.label))
const hasFilters = computed(() => selectedNeeds.value.length > 0 || selectedTheme.value !== 'all')
const totalFilteredOut = computed(() => themeCandidates.value.length - visibleCandidates.value.length)
const auditLabelById = Object.fromEntries(accessOptions.map((option) => [option.id, option.label]))
function auditLabelsFor(candidate) {
  return candidate.auditFocus.map((id) => auditLabelById[id]).filter(Boolean)
}

function togglePassport(id) {
  expandedPassportId.value = expandedPassportId.value === id ? null : id
}

function toggleNeed(id) {
  selectedNeeds.value = selectedNeeds.value.includes(id)
    ? selectedNeeds.value.filter((value) => value !== id)
    : [...selectedNeeds.value, id]
}
function resetFilters() {
  selectedNeeds.value = []
  selectedTheme.value = 'all'
}
</script>

<template>
  <div class="rp-access-root">
    <section class="rp-access-hero">
      <div class="rp-access-hero-copy">
        <span class="rp-access-eyebrow"><span class="rp-access-dot"></span> НОВОЕ НАПРАВЛЕНИЕ RUSSPLORE</span>
        <h1>Путешествия<br><em>без барьеров</em></h1>
        <p>Маршруты для людей с разными потребностями, ветеранов СВО, членов их семей и других путешественников. Удобство путешествия начинается с достоверной информации.</p>
        <div class="rp-access-hero-actions">
          <a href="#rp-access-catalog" class="rp-access-primary">Смотреть направления <span aria-hidden="true">→</span></a>
          <button type="button" class="rp-access-secondary" @click="$emit('back')">К обычным маршрутам</button>
        </div>
        <p class="rp-access-hero-note">Пилотная версия раздела · сведения о доступности пока проходят подготовку к проверке</p>
      </div>
      <div class="rp-access-hero-visual" aria-hidden="true">
        <div class="rp-access-visual-disc">
          <svg viewBox="0 0 24 24" width="86" height="86" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11.5" cy="4.5" r="1.8"/><path d="M11.5 7v6h5l2.6 4.5"/><path d="M11.5 10H8.4"/><path d="M7.2 12.5a6.6 6.6 0 1 0 9.8 7.2"/>
          </svg>
        </div>
        <div class="rp-access-visual-card"><span class="rp-access-visual-kicker">ДОСТУПНОСТЬ</span><strong>В деталях каждого маршрута</strong><small>Проверка перед публикацией</small></div>
      </div>
    </section>

    <section class="rp-access-info" role="status">
      <span class="rp-access-info-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>
      </span>
      <div>
        <strong>Маршруты пока не подтверждены как доступные</strong>
        <p>Ниже — кандидаты для обследования, а не готовые рекомендации. Мы не будем маркировать маршрут подходящим для кресла-коляски или других потребностей без проверки всего пути.</p>
      </div>
    </section>

    <section class="rp-access-layout" id="rp-access-catalog" aria-label="Будущие доступные маршруты">
      <aside class="rp-access-filters">
        <div class="rp-access-filter-head"><div><span class="rp-access-eyebrow">ПОДБОР</span><h2>Ваши условия</h2></div><button v-if="hasFilters" type="button" class="rp-access-header-reset" @click="resetFilters">Сбросить</button></div>
        <p class="rp-access-filter-intro">Выберите нужные условия. Список справа покажет кандидатов, для которых эти параметры <strong>включены в предложенный план обследования</strong>. Это не подтверждение доступности.</p>
        <div class="rp-access-checks">
          <label v-for="option in accessOptions" :key="option.id" class="rp-access-check" :class="{ 'is-selected': selectedNeeds.includes(option.id) }">
            <input type="checkbox" :checked="selectedNeeds.includes(option.id)" @change="toggleNeed(option.id)">
            <span class="rp-access-checkbox" aria-hidden="true">
              <svg v-if="selectedNeeds.includes(option.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>
            </span>
            <span><strong>{{ option.label }}</strong><small>{{ option.detail }}</small></span>
          </label>
        </div>
        <div class="rp-access-filter-summary">
          <strong>{{ selectedNeeds.length ? `Критериев проверки: ${selectedNeeds.length}` : 'Критерии проверки не выбраны' }}</strong>
          <p v-if="chosenLabels.length">{{ chosenLabels.join(' · ') }}</p>
          <p v-else>Без выбора условий показаны все кандидаты по тематике.</p>
          <p v-if="chosenLabels.length" class="rp-access-filter-hint">Ни один из этих параметров ещё не подтверждён обследованием.</p>
        </div>
      </aside>

      <div class="rp-access-catalog">
        <div class="rp-access-section-head"><div><span class="rp-access-eyebrow">ПЕРВЫЙ ЭТАП · МОСКВА</span><h2>Кандидаты на обследование</h2><p>Фильтр выбирает планы проверок, а не маршруты с доказанной доступностью.</p></div><span class="rp-access-count" aria-live="polite">{{ visibleCandidates.length }} из {{ pilotCandidates.length }}</span></div>
        <div class="rp-access-tabs" role="group" aria-label="Тематика маршрута">
          <button v-for="theme in themes" :key="theme.id" type="button" :class="{ 'is-active': selectedTheme === theme.id }" :aria-pressed="selectedTheme === theme.id" @click="selectedTheme = theme.id">{{ theme.label }}</button>
        </div>
        <div class="rp-access-match-bar" role="status" aria-live="polite">
          <div>
            <strong>{{ chosenLabels.length ? `Найдено для проверки: ${visibleCandidates.length}` : `Показано кандидатов: ${visibleCandidates.length}` }}</strong>
            <p v-if="chosenLabels.length">Все {{ chosenLabels.length }} условия входят в демонстрационный план проверки этих кандидатов. Доступность пока неизвестна.</p>
            <p v-else>Выберите требования слева, чтобы сузить список будущих обследований.</p>
            <small v-if="selectedNeeds.length && totalFilteredOut">Не включены в план по выбранным условиям: {{ totalFilteredOut }}</small>
          </div>
          <button v-if="hasFilters" type="button" class="rp-access-clear" @click="resetFilters">Очистить фильтры</button>
        </div>
        <div v-if="visibleCandidates.length" class="rp-access-cards">
          <article v-for="candidate in visibleCandidates" :key="candidate.id" class="rp-access-card">
            <div class="rp-access-card-head"><span class="rp-access-card-number">{{ candidate.number }}</span><span class="rp-access-pending">Доступность не подтверждена</span></div>
            <span class="rp-access-card-type">{{ candidate.label }}</span>
            <h3>{{ candidate.title }}</h3>
            <p>{{ candidate.description }}</p>
            <div class="rp-access-checklist">
              <strong>{{ chosenOptions.length ? 'Ваши условия — в плане обследования:' : 'В плане обследования:' }}</strong>
              <div class="rp-access-audit-tags">
                <span v-for="label in (chosenOptions.length ? chosenOptions.map((option) => option.label) : auditLabelsFor(candidate))" :key="label">{{ label }} <small>· не проверено</small></span>
              </div>
              <details class="rp-access-audit-details"><summary>Что ещё предстоит изучить</summary><ul><li v-for="item in candidate.check" :key="item">{{ item }}</li></ul></details>
            </div>
            <div class="rp-access-card-foot">
              <span>Москва · данные ожидают проверки</span>
              <button
                type="button"
                class="rp-access-passport-btn"
                :aria-expanded="expandedPassportId === candidate.id"
                :aria-controls="`rp-passport-${candidate.id}`"
                @click="togglePassport(candidate.id)"
              >
                {{ expandedPassportId === candidate.id ? 'Скрыть паспорт' : 'Паспорт доступности' }}
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="expandedPassportId === candidate.id ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'"/></svg>
              </button>
            </div>
            <AccessibilityPassport
              v-if="expandedPassportId === candidate.id"
              :id="`rp-passport-${candidate.id}`"
              :candidate="candidate"
            />
          </article>
        </div>
        <div v-else class="rp-access-empty">
          <strong>По выбранным условиям пока нет плана обследования</strong>
          <p>Это не означает, что в Москве нет доступных мест. Просто в нашем пилотном списке нет кандидатов, у которых запланирована проверка всех выбранных критериев.</p>
          <button type="button" class="rp-access-clear" @click="resetFilters">Показать все направления</button>
        </div>
        <p class="rp-access-disclaimer"><strong>Важно:</strong> сейчас фильтры работают по запланированным проверкам, а не по фактической доступности. После обследования добавим подтверждённые параметры, дату проверки и построение проходимого пути. До этого не используйте этот каталог как гарантию доступности.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rp-access-root{width:100%;display:flex;flex-direction:column;gap:20px;color:#193347;min-width:0}
.rp-access-root *, .rp-access-root *::before,.rp-access-root *::after{box-sizing:border-box}
.rp-access-root button{cursor:pointer;margin:0;max-width:100%;font:inherit}
.rp-access-root svg{display:block;max-width:100%}
.rp-access-hero{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(240px,.55fr);overflow:hidden;min-height:346px;border:1px solid #dce9e8;border-radius:24px;background:linear-gradient(116deg,#fff 38%,#eff8f5 100%)}
.rp-access-hero-copy{padding:clamp(28px,4vw,54px);display:flex;flex-direction:column;align-items:flex-start}
.rp-access-eyebrow{display:inline-flex;align-items:center;gap:8px;color:#078b7c;font-size:10px;font-weight:800;letter-spacing:.09em}
.rp-access-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#078b7c}
.rp-access-hero h1{margin:20px 0 13px;font-size:clamp(32px,4.4vw,58px);line-height:1.07;letter-spacing:-.045em;color:#193347}
.rp-access-hero h1 em{color:#078b7c;font-style:normal}
.rp-access-hero-copy>p:not(.rp-access-hero-note){margin:0;color:#657b88;max-width:610px;line-height:1.7;font-size:14px}
.rp-access-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}
.rp-access-primary,.rp-access-secondary{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:43px;padding:11px 17px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:800}
.rp-access-primary{border:1px solid #078b7c;background:#078b7c;color:#fff}.rp-access-primary:hover{background:#056e64;color:#fff}
.rp-access-secondary{border:1px solid #d8e5e6;background:#fff;color:#294c5b}.rp-access-secondary:hover{background:#f0f8f6}
.rp-access-hero-note{margin:18px 0 0;color:#82939e;font-size:11px}
.rp-access-hero-visual{position:relative;display:grid;place-items:center;min-height:260px;overflow:hidden}
.rp-access-hero-visual:before{content:"";position:absolute;width:360px;height:360px;border:1px solid #cfe7df;border-radius:50%;left:-30px;top:-70px}
.rp-access-hero-visual:after{content:"";position:absolute;width:260px;height:260px;border:1px solid #d6ebe4;border-radius:50%;right:-95px;bottom:-100px}
.rp-access-visual-disc{position:relative;z-index:1;display:grid;place-items:center;width:160px;height:160px;border-radius:50%;background:#dff2e9;color:#078b7c;border:14px solid #f8fcfa;box-shadow:0 15px 40px #16756212}
.rp-access-visual-disc svg{width:86px!important;height:86px!important;flex:none}
.rp-access-visual-card{position:absolute;z-index:2;right:20px;bottom:30px;display:flex;flex-direction:column;gap:5px;padding:14px 16px;background:#fff;border:1px solid #dbe9e7;border-radius:13px;box-shadow:0 8px 25px #19334713;max-width:190px}
.rp-access-visual-kicker{color:#078b7c;font-size:9px;letter-spacing:.09em;font-weight:800}
.rp-access-visual-card strong{font-size:12px;line-height:1.35}.rp-access-visual-card small{color:#718892;font-size:10px}
.rp-access-info{display:flex;align-items:flex-start;gap:14px;background:#f3f8fa;border:1px solid #dfeaed;border-radius:16px;padding:18px 20px}
.rp-access-info-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:11px;background:#e4f3f1;color:#078b7c}.rp-access-info-icon svg{width:20px!important;height:20px!important}
.rp-access-info strong{font-size:13px}.rp-access-info p{margin:5px 0 0;line-height:1.65;font-size:12px;color:#657b88}
.rp-access-layout{display:grid;grid-template-columns:minmax(250px,305px) minmax(0,1fr);gap:18px;align-items:start;scroll-margin-top:24px}
.rp-access-filters,.rp-access-catalog{border-radius:20px;background:#fff;border:1px solid #e0e9ed;padding:22px;min-width:0}
.rp-access-filter-head{display:flex;align-items:end;justify-content:space-between;gap:10px}.rp-access-filter-head h2{font-size:22px;margin:6px 0 0}.rp-access-filter-head button{border:0;background:transparent;color:#078b7c;font-size:11px;font-weight:800;padding:3px 0}
.rp-access-filter-intro{margin:12px 0 16px;color:#718593;font-size:11px;line-height:1.65}
.rp-access-checks{display:flex;flex-direction:column;gap:7px}
.rp-access-check{display:flex;align-items:flex-start;gap:10px;padding:11px;border:1px solid #e6eef0;border-radius:11px;cursor:pointer;background:#fff;position:relative}
.rp-access-check.is-selected{background:#f1faf7;border-color:#a7d9ca}
.rp-access-check input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
.rp-access-check:focus-within{outline:2px solid #078b7c;outline-offset:2px}
.rp-access-checkbox{display:grid;place-items:center;width:19px;height:19px;flex:0 0 19px;border:1.5px solid #b9cace;border-radius:6px;background:#fff;color:#fff;margin-top:2px}
.rp-access-check.is-selected .rp-access-checkbox{border-color:#078b7c;background:#078b7c}
.rp-access-check strong,.rp-access-check small{display:block}.rp-access-check strong{font-size:11px;line-height:1.45}.rp-access-check small{font-size:10px;color:#7a8e9a;line-height:1.5;margin-top:2px}
.rp-access-filter-summary{margin-top:16px;padding:14px;background:#f1f8f6;border:1px solid #dcefe8;border-radius:12px}.rp-access-filter-summary strong{font-size:11px;color:#087b6e}.rp-access-filter-summary p{margin:5px 0 0;font-size:10px;line-height:1.6;color:#647f83;overflow-wrap:anywhere}
.rp-access-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px}.rp-access-section-head h2{font-size:clamp(23px,2.5vw,30px);margin:7px 0 5px;color:#193347}.rp-access-section-head p{font-size:12px;color:#708694;margin:0}.rp-access-count{white-space:nowrap;font-size:10px;font-weight:800;color:#078b7c;padding:7px 10px;background:#eaf7f3;border-radius:20px}
.rp-access-tabs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:23px 0 18px}.rp-access-tabs button{width:auto!important;border:1px solid #dfeaed;padding:8px 11px;background:#fff;color:#607b87;font-size:11px;font-weight:700;border-radius:9px}.rp-access-tabs button.is-active{background:#078b7c;color:#fff;border-color:#078b7c}
.rp-access-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.rp-access-card{display:flex;flex-direction:column;min-width:0;padding:19px;border:1px solid #e2ebec;border-radius:15px;background:#fff}
.rp-access-card-head{display:flex;justify-content:space-between;align-items:center;gap:9px;margin-bottom:20px}.rp-access-card-number{display:grid;place-items:center;width:35px;height:35px;border-radius:10px;background:#eaf6f2;color:#078b7c;font-size:12px;font-weight:800}.rp-access-pending{font-size:10px;background:#f5f7f8;color:#6c8290;padding:5px 8px;border-radius:7px}
.rp-access-card-type{font-size:10px;color:#078b7c;font-weight:800;letter-spacing:.05em}.rp-access-card h3{margin:8px 0 9px;font-size:17px;line-height:1.3}.rp-access-card>p{margin:0 0 17px;line-height:1.65;font-size:11px;color:#697f8c}
.rp-access-checklist{margin-top:auto;background:#f7faf9;border-radius:11px;padding:13px}.rp-access-checklist strong{font-size:10px;color:#4d6470}.rp-access-checklist ul{margin:8px 0 0;padding-left:18px;color:#687f89;font-size:10px;line-height:1.8}
.rp-access-card-foot{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:15px;padding-top:12px;border-top:1px solid #e9f0f1;color:#7e929d;font-size:10px}.rp-access-card-foot span:last-child{color:#078b7c;font-size:17px}
.rp-access-disclaimer{margin:18px 0 0;font-size:11px;line-height:1.65;color:#758a97}.rp-access-empty{padding:35px 20px;border-radius:12px;background:#f6f9fa;color:#687f89;font-size:12px;text-align:center}
.rp-access-filter-hint{border-top:1px solid #d3e5df;margin-top:9px!important;padding-top:9px;color:#7a6970!important}
.rp-access-match-bar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:0 0 16px;padding:14px 16px;border:1px solid #d4ebe2;border-radius:12px;background:#f0f9f5}
.rp-access-match-bar strong{font-size:12px;color:#087d6e}
.rp-access-match-bar p{margin:4px 0 0;color:#597881;line-height:1.5;font-size:11px}
.rp-access-match-bar small{display:block;margin-top:5px;font-size:10px;color:#71828b}
.rp-access-clear{flex:0 0 auto!important;display:inline-flex;justify-content:center;align-items:center;background:#fff!important;color:#087b6e!important;border:1px solid #bdded4!important;border-radius:9px!important;padding:9px 12px!important;font-size:11px!important;font-weight:800!important;width:auto!important}
.rp-access-clear:hover{background:#e0f3ed!important}
.rp-access-audit-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.rp-access-audit-tags>span{font-size:10px;font-weight:700;color:#27685b;background:#e7f4ee;border:1px solid #d6e9e0;padding:5px 8px;border-radius:7px}
.rp-access-audit-tags small{font-size:9px;font-weight:500;color:#687f7e}
.rp-access-audit-details{margin-top:13px;padding-top:10px;border-top:1px solid #e2edeb}
.rp-access-audit-details summary{cursor:pointer;font-size:10px;color:#567583;font-weight:700}
.rp-access-empty{display:flex;flex-direction:column;align-items:center;gap:10px;line-height:1.5}
.rp-access-empty strong{font-size:14px;color:#274658}
.rp-access-empty p{font-size:11px;max-width:470px;margin:0}
@media(max-width:650px){.rp-access-match-bar{flex-direction:column;align-items:stretch}.rp-access-clear{align-self:flex-start}}
@media(max-width:1050px){.rp-access-layout{grid-template-columns:1fr}.rp-access-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){.rp-access-hero{grid-template-columns:1fr}.rp-access-hero-visual{display:none}.rp-access-hero-copy{padding:26px}.rp-access-cards{grid-template-columns:1fr}.rp-access-filters,.rp-access-catalog{padding:17px}}
@media(max-width:470px){.rp-access-checks{grid-template-columns:1fr}.rp-access-section-head{align-items:start;flex-direction:column}.rp-access-hero-actions{flex-direction:column;align-items:stretch;width:100%}.rp-access-primary,.rp-access-secondary{width:100%;text-align:center}}

/* Russplore 2.0: вторичные кнопки и раскрытие паспорта доступности */
.rp-access-header-reset,.rp-access-passport-btn{
  display:inline-flex!important;justify-content:center;align-items:center;gap:7px;
  width:auto!important;max-width:100%;min-height:36px;margin:0!important;
  padding:8px 12px!important;border:1px solid #c7e3db!important;
  border-radius:10px!important;background:#f2faf7!important;color:#08796f!important;
  font-size:11px!important;font-weight:800!important;line-height:1.35!important;
  cursor:pointer;transition:background .18s ease,border-color .18s ease;
}
.rp-access-header-reset:hover,.rp-access-passport-btn:hover{
  background:#e1f3ec!important;border-color:#88c9b5!important;
}
.rp-access-header-reset:focus-visible,.rp-access-passport-btn:focus-visible{
  outline:3px solid #79d2c2;outline-offset:2px;
}
.rp-access-passport-btn{min-height:38px;white-space:normal;text-align:center;}
.rp-access-passport-btn svg{width:15px!important;height:15px!important;flex:0 0 15px;}
.rp-access-card-foot{align-items:center;flex-wrap:wrap;}
.rp-access-card-foot span:last-child{font-size:10px;color:#7e929d;}
@media(max-width:520px){.rp-access-passport-btn{width:100%!important;}.rp-access-card-foot{align-items:stretch;flex-direction:column;}}

</style>
