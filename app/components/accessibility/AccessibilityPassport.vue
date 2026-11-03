<script setup>
import { computed } from 'vue'
import { accessibilityCriteria, routeAccessibilityAudits } from '../data/accessibilityAudits.js'

const props = defineProps({
  candidate: { type: Object, required: true }
})

const audit = computed(() => routeAccessibilityAudits[props.candidate.id] || null)

const knownStatuses = {
  available: { text: 'Подтверждено', css: 'is-available' },
  limited: { text: 'Есть ограничения', css: 'is-limited' },
  unavailable: { text: 'Недоступно', css: 'is-unavailable' },
  unknown: { text: 'Не проверено', css: 'is-unknown' }
}

function confirmedState(entry) {
  if (!entry || !['available', 'limited', 'unavailable'].includes(entry.status)) {
    return 'unknown'
  }
  // Принцип: без даты и источника нет доказанного результата обследования.
  if (!entry.checkedAt || !entry.source) return 'unknown'
  return entry.status
}

const checklist = computed(() => accessibilityCriteria.map((criterion) => {
  const record = audit.value?.criteria?.[criterion.id] || null
  const status = confirmedState(record)
  return {
    ...criterion,
    status,
    statusText: knownStatuses[status].text,
    css: knownStatuses[status].css,
    checkedAt: status === 'unknown' ? null : record.checkedAt,
    source: status === 'unknown' ? '' : record.source,
    sourceUrl: status === 'unknown' ? '' : record.sourceUrl,
    notes: status === 'unknown' ? '' : record.notes,
    inPlan: Boolean(props.candidate.auditFocus?.includes(criterion.id))
  }
}))
const confirmedCount = computed(() => checklist.value.filter((item) => item.status !== 'unknown').length)

function sourceIsUrl(url) {
  return typeof url === 'string' && /^https:\/\//i.test(url)
}
function formattedDate(date) {
  if (!date) return 'Не проводилась'
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? 'Дата не указана' : parsed.toLocaleDateString('ru-RU')
}
</script>

<template>
  <section class="rp-passport" aria-label="Паспорт доступности">
    <div class="rp-passport-head">
      <div>
        <span class="rp-passport-kicker">ПАСПОРТ ДОСТУПНОСТИ · ПИЛОТ</span>
        <h4>Проверка условий маршрута</h4>
      </div>
      <span class="rp-passport-count">{{ confirmedCount }} / {{ checklist.length }} проверено</span>
    </div>
    <p class="rp-passport-explainer">Данные ниже отражают только подтверждённые результаты обследований. Отсутствие сведений не означает, что препятствий нет.</p>
    <div class="rp-passport-grid">
      <div v-for="item in checklist" :key="item.id" class="rp-passport-item">
        <div class="rp-passport-item-top">
          <strong>{{ item.title }}</strong>
          <span class="rp-passport-status" :class="item.css">{{ item.statusText }}</span>
        </div>
        <p>{{ item.description }}</p>
        <small class="rp-passport-plan">{{ item.inPlan ? 'В плане пилотного обследования' : 'Не включено в пилотный план' }}</small>
        <div v-if="item.status !== 'unknown'" class="rp-passport-evidence">
          <p v-if="item.notes">{{ item.notes }}</p>
          <span>Проверено: {{ formattedDate(item.checkedAt) }}</span>
          <a v-if="sourceIsUrl(item.sourceUrl)" :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">Источник: {{ item.source }}</a>
          <span v-else>Источник: {{ item.source }}</span>
        </div>
      </div>
    </div>
    <div class="rp-passport-footer">
      <span><strong>Последняя проверка маршрута:</strong> {{ formattedDate(audit?.routeCheckedAt) }}</span>
      <span>Маршрут в целом не подтверждён как доступный.</span>
    </div>
  </section>
</template>

<style scoped>
.rp-passport,.rp-passport *,.rp-passport *::before,.rp-passport *::after{box-sizing:border-box}
.rp-passport{margin-top:15px;padding:16px;border-radius:13px;border:1px solid #d2e8e1;background:#f7fbf9;color:#193347}
.rp-passport-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.rp-passport-kicker{display:block;color:#087e70;font-size:9px;font-weight:800;letter-spacing:.08em}
.rp-passport h4{margin:5px 0 0;font-size:14px;line-height:1.3;letter-spacing:-.02em}
.rp-passport-count{flex:0 0 auto;background:#e7f2ed;color:#216f60;padding:5px 8px;border-radius:8px;font-size:10px;font-weight:800}
.rp-passport-explainer{margin:12px 0;font-size:10px;line-height:1.6;color:#647d86}
.rp-passport-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.rp-passport-item{min-width:0;padding:10px;background:#fff;border:1px solid #e0ebe8;border-radius:10px}
.rp-passport-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap}
.rp-passport-item strong{font-size:11px;line-height:1.35}
.rp-passport-status{padding:4px 6px;border-radius:6px;font-size:9px;font-weight:800;white-space:nowrap}
.rp-passport-status.is-unknown{color:#617681;background:#eff2f4}
.rp-passport-status.is-available{color:#087057;background:#def4e8}
.rp-passport-status.is-limited{color:#916210;background:#fff1d1}
.rp-passport-status.is-unavailable{color:#a03939;background:#fdecec}
.rp-passport-item p{margin:5px 0;font-size:10px;color:#687e89;line-height:1.55}
.rp-passport-plan{color:#77929b;font-size:9px}
.rp-passport-evidence{display:flex;flex-direction:column;gap:4px;margin-top:9px;padding-top:8px;border-top:1px solid #e7eded;color:#607784;font-size:9px;line-height:1.5;overflow-wrap:anywhere}
.rp-passport-evidence p{margin:0}.rp-passport-evidence a{font-size:9px;color:#078b7c;text-decoration:underline}
.rp-passport-footer{display:flex;flex-direction:column;gap:5px;border-top:1px solid #d9e8e2;padding-top:10px;margin-top:12px;color:#637d87;font-size:10px;line-height:1.6}
@media(max-width:560px){.rp-passport-grid{grid-template-columns:1fr}.rp-passport-head{flex-wrap:wrap}.rp-passport{padding:12px}}
</style>
