<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  candidate: { type: Object, required: true }
})

// Черновик полевого обследования, НЕ опубликованный паспорт доступности.
// Сознательно не подключается к accessibilityAudits.js или Supabase.
const criteria = [
  { id: 'stepFree', title: 'Без ступеней', hint: 'Запишите перепады высот, бордюры, входы и альтернативные пути.' },
  { id: 'wheelchair', title: 'Путь для кресла-коляски', hint: 'Отметьте покрытие, ширину, уклоны и непрерывность пути.' },
  { id: 'rest', title: 'Места отдыха', hint: 'Укажите расположение скамеек и возможность подъехать к ним.' },
  { id: 'toilet', title: 'Доступный туалет', hint: 'Укажите адрес, режим работы и проверенные условия использования.' },
  { id: 'parking', title: 'Парковка', hint: 'Отметьте специальные места и путь от парковки к маршруту.' },
  { id: 'companion', title: 'Сопровождение', hint: 'Уточните наличие услуги, контакт и порядок обращения.' },
  { id: 'quiet', title: 'Спокойный темп', hint: 'Укажите протяжённость, шумные участки и места пауз.' },
  { id: 'family', title: 'Семейная прогулка', hint: 'Отметьте доступность для сопровождающих и семей с детьми.' }
]

const statusOptions = [
  { value: 'unknown', label: 'Не проверено' },
  { value: 'available', label: 'Условие подтверждено' },
  { value: 'limited', label: 'Есть ограничения' },
  { value: 'unavailable', label: 'Условие не выполнено' }
]

function makeDraft() {
  return {
    routeId: props.candidate.id,
    routeTitle: props.candidate.title,
    checkedAt: '',
    inspector: '',
    source: '',
    routeBounds: '',
    generalNotes: '',
    criteria: Object.fromEntries(criteria.map((criterion) => [criterion.id, {
      status: 'unknown',
      notes: '',
      evidence: ''
    }]))
  }
}

const draft = ref(makeDraft())
const ready = ref(false)
const saveMessage = ref('')
const storageKey = computed(() => `russplore:accessibility:audit-draft:v1:${props.candidate.id}`)
const assessedCount = computed(() => criteria.filter(({ id }) =>
  draft.value.criteria?.[id]?.status !== 'unknown' &&
  Boolean(draft.value.criteria?.[id]?.notes?.trim())
).length)
const incompleteCount = computed(() => criteria.filter(({ id }) =>
  draft.value.criteria?.[id]?.status !== 'unknown' &&
  !draft.value.criteria?.[id]?.notes?.trim()
).length)
const canReferenceInspection = computed(() =>
  Boolean(draft.value.checkedAt && draft.value.inspector.trim() && draft.value.source.trim() && draft.value.routeBounds.trim())
)

onMounted(() => {
  try {
    const saved = window.localStorage.getItem(storageKey.value)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed?.routeId === props.candidate.id && parsed?.criteria) {
        const fresh = makeDraft()
        draft.value = {
          ...fresh,
          ...parsed,
          criteria: Object.fromEntries(criteria.map(({ id }) => [id, {
            ...fresh.criteria[id],
            ...(parsed.criteria?.[id] || {})
          }]))
        }
        saveMessage.value = 'Восстановлен черновик с этого компьютера'
      }
    }
  } catch (error) {
    saveMessage.value = 'Не удалось прочитать сохранённый черновик'
  } finally {
    ready.value = true
  }
})

watch(draft, (value) => {
  if (!ready.value || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey.value, JSON.stringify(value))
    saveMessage.value = 'Черновик автоматически сохранён в этом браузере'
  } catch (error) {
    saveMessage.value = 'Автосохранение недоступно — скачайте файл с черновиком'
  }
}, { deep: true })

function downloadDraft() {
  if (typeof window === 'undefined') return
  const payload = {
    schema: 'russplore.accessibility.audit-draft.v1',
    publicationStatus: 'draft-not-verified',
    exportedAt: new Date().toISOString(),
    ...JSON.parse(JSON.stringify(draft.value))
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `russplore-access-audit-${props.candidate.id}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function clearDraft() {
  if (typeof window === 'undefined' || !window.confirm('Удалить локальный черновик обследования этого маршрута?')) return
  draft.value = makeDraft()
  try {
    window.localStorage.removeItem(storageKey.value)
  } catch (error) {
    // При блокировке localStorage содержимое формы всё равно сбрасывается.
  }
  saveMessage.value = 'Черновик очищен'
}
</script>

<template>
  <section class="rp-audit-workspace" :aria-label="`Черновик обследования: ${candidate.title}`">
    <div class="rp-audit-workspace-head">
      <div>
        <span class="rp-audit-dev-label">ЛОКАЛЬНЫЙ ИНСТРУМЕНТ · ЧЕРНОВИК</span>
        <h4>Акт обследования маршрута</h4>
        <p>Фиксируйте наблюдения по всему пути, а не только по отдельной достопримечательности.</p>
      </div>
      <span class="rp-audit-counter">{{ assessedCount }} из {{ criteria.length }} с пояснениями</span>
    </div>

    <div class="rp-audit-warning" role="note">
      Эта форма предназначена для подготовки данных. Она не подтверждает доступность и не публикует результаты в Russplore. Данные хранятся только в браузере этого компьютера.
    </div>

    <div class="rp-audit-fields">
      <label>
        <span>Дата обследования</span>
        <input v-model="draft.checkedAt" type="date" autocomplete="off">
      </label>
      <label>
        <span>Кто обследовал</span>
        <input v-model="draft.inspector" type="text" maxlength="120" placeholder="Имя или организация" autocomplete="off">
      </label>
      <label class="rp-audit-wide">
        <span>Источник данных / способ проверки</span>
        <input v-model="draft.source" type="text" maxlength="240" placeholder="Например: личный осмотр участка, измерения, фотофиксация" autocomplete="off">
      </label>
      <label class="rp-audit-wide">
        <span>Границы маршрута</span>
        <textarea v-model="draft.routeBounds" rows="2" maxlength="1000" placeholder="Укажите начальную и конечную точку, промежуточные участки и проверенный путь" />
      </label>
    </div>

    <div class="rp-audit-progress-line">
      <strong>Параметры доступности</strong>
      <span v-if="!canReferenceInspection">Для будущей проверки нужны дата, обследователь, источник и границы маршрута</span>
      <span v-else>Реквизиты обследования заполнены</span>
    </div>

    <div class="rp-audit-items">
      <div v-for="criterion in criteria" :key="criterion.id" class="rp-audit-item">
        <div class="rp-audit-item-heading">
          <div>
            <strong>{{ criterion.title }}</strong>
            <small>{{ criterion.hint }}</small>
          </div>
          <span v-if="candidate.auditFocus?.includes(criterion.id)" class="rp-audit-inplan">В плане</span>
        </div>
        <div class="rp-audit-item-controls">
          <label>
            <span>Результат проверки</span>
            <select v-model="draft.criteria[criterion.id].status">
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label>
            <span>Наблюдения и измерения</span>
            <textarea v-model="draft.criteria[criterion.id].notes" rows="2" maxlength="1800" placeholder="Участок, измерения, ограничения, условия использования" />
          </label>
          <label class="rp-audit-wide">
            <span>Подтверждающий материал (описание или ссылка)</span>
            <input v-model="draft.criteria[criterion.id].evidence" type="text" maxlength="500" placeholder="Например: фото 03, акт осмотра, ссылка на источник" autocomplete="off">
          </label>
          <p v-if="draft.criteria[criterion.id].status !== 'unknown' && !draft.criteria[criterion.id].notes.trim()" class="rp-audit-required">Добавьте наблюдения, прежде чем считать этот пункт обследованным.</p>
        </div>
      </div>
    </div>

    <label class="rp-audit-general-notes">
      <span>Общие замечания по маршруту</span>
      <textarea v-model="draft.generalNotes" rows="3" maxlength="3000" placeholder="Необследованные участки, препятствия, условия повторной проверки" />
    </label>

    <div class="rp-audit-bottom">
      <div>
        <strong>{{ assessedCount }} из 8 пунктов с пояснениями</strong>
        <small v-if="incompleteCount">Требуют описания: {{ incompleteCount }}</small>
        <small>{{ saveMessage || 'Изменения сохраняются только на этом устройстве' }}</small>
      </div>
      <div class="rp-audit-actions">
        <button type="button" class="rp-audit-clear" @click="clearDraft">Очистить черновик</button>
        <button type="button" class="rp-audit-download" @click="downloadDraft">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/></svg>
          Скачать черновик JSON
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rp-audit-workspace,.rp-audit-workspace *,.rp-audit-workspace *::before,.rp-audit-workspace *::after{box-sizing:border-box}
.rp-audit-workspace{margin-top:12px;border:1px solid #c9e3da;background:#f8fbfa;border-radius:15px;padding:20px;color:#193347;min-width:0}
.rp-audit-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px}
.rp-audit-dev-label{display:block;color:#078b7c;letter-spacing:.08em;font-size:10px;font-weight:800}
.rp-audit-workspace h4{font-size:18px;margin:6px 0 5px;line-height:1.3}
.rp-audit-workspace p{font-size:12px;line-height:1.65;color:#66808b;margin:0}
.rp-audit-counter{flex-shrink:0;padding:8px 10px;background:#e8f5ef;color:#0b796a;border-radius:10px;font-weight:800;font-size:11px}
.rp-audit-warning{padding:12px 14px;border:1px solid #eadfba;background:#fffaf0;color:#755e26;border-radius:11px;font-size:11px;line-height:1.6;margin:12px 0 17px}
.rp-audit-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px}
.rp-audit-workspace label{min-width:0;display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:700;color:#4a6471}
.rp-audit-workspace label>span{line-height:1.45}
.rp-audit-workspace input,.rp-audit-workspace select,.rp-audit-workspace textarea{width:100%;min-width:0;border-radius:10px;border:1px solid #d3e2e4;background:#fff;color:#193347;padding:10px 12px;font:inherit;font-size:12px;line-height:1.4;resize:vertical}
.rp-audit-workspace input:focus-visible,.rp-audit-workspace select:focus-visible,.rp-audit-workspace textarea:focus-visible{outline:2px solid #0b9683;outline-offset:1px}
.rp-audit-wide{grid-column:1/-1}
.rp-audit-progress-line{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:12px 0;border-top:1px solid #e1eaeb}
.rp-audit-progress-line strong{font-size:13px}
.rp-audit-progress-line span{font-size:10px;color:#66808b}
.rp-audit-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.rp-audit-item{background:#fff;border:1px solid #dfeaec;border-radius:13px;padding:14px;min-width:0}
.rp-audit-item-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;min-height:55px;margin-bottom:13px}
.rp-audit-item-heading strong,.rp-audit-item-heading small{display:block}
.rp-audit-item-heading strong{font-size:12px;line-height:1.4}
.rp-audit-item-heading small{margin-top:4px;font-size:10px;color:#78909b;line-height:1.5}
.rp-audit-inplan{flex-shrink:0;border-radius:7px;background:#e7f5ef;color:#078b7c;padding:4px 7px;font-size:9px;font-weight:800}
.rp-audit-item-controls{display:grid;gap:10px}
.rp-audit-item .rp-audit-required{color:#a95c13;font-size:10px}
.rp-audit-general-notes{margin-top:17px}
.rp-audit-bottom{border-top:1px solid #dcebe8;padding-top:15px;margin-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}
.rp-audit-bottom>div:first-child{display:flex;flex-direction:column;gap:5px}
.rp-audit-bottom strong{font-size:11px}.rp-audit-bottom small{color:#708793;font-size:10px}
.rp-audit-actions{display:flex;gap:8px;flex-wrap:wrap}
.rp-audit-actions button{width:auto!important;display:inline-flex;gap:9px;align-items:center;justify-content:center;margin:0!important;padding:11px 14px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer}
.rp-audit-clear{background:#fff;color:#5d7783;border:1px solid #d5e1e3}
.rp-audit-download{background:#078b7c;color:#fff;border:1px solid #078b7c}
.rp-audit-download:hover{background:#056e64}.rp-audit-clear:hover{background:#f1f7f7}
.rp-audit-download svg{width:16px!important;height:16px!important;flex:0 0 16px}
@media(max-width:760px){.rp-audit-items,.rp-audit-fields{grid-template-columns:1fr}.rp-audit-workspace{padding:15px}.rp-audit-workspace-head{flex-wrap:wrap}}
</style>
