/**
 * Russplore — паспорта доступности пилотных локаций.
 *
 * ВАЖНО: эти записи НЕ подтверждают доступность ни одного объекта.
 * Каждый параметр по умолчанию имеет status: 'unknown'.
 *
 * Поддерживаемые статусы:
 *   unknown     — не проверено
 *   available   — подтверждена доступность конкретного параметра
 *   limited     — установлены ограничения; детали обязательны
 *   unavailable — подтверждена недоступность конкретного параметра
 *
 * Чтобы UI показал что-либо кроме «Не проверено», нужно указать:
 * status, checkedAt (YYYY-MM-DD), source (название источника/обследования).
 * Указывайте notes, если есть условия или ограничения. Ссылку можно
 * добавить в sourceUrl. Не подставляйте предположения вместо измерений.
 *
 * Поля самого маршрута и даты проверок отдельных критериев независимы:
 * подтверждение входа не подтверждает проходимость всей трассы.
 */
export const accessibilityCriteria = [
  { id: 'stepFree', title: 'Без ступеней', description: 'Подходы, входы, бордюры, перепады высот' },
  { id: 'wheelchair', title: 'Кресло-коляска', description: 'Ширина, уклоны, покрытие и непрерывность пути' },
  { id: 'rest', title: 'Места отдыха', description: 'Скамейки и доступные зоны для пауз' },
  { id: 'toilet', title: 'Доступный туалет', description: 'Санузел и возможность его использования' },
  { id: 'parking', title: 'Парковка', description: 'Специальные места и путь от них' },
  { id: 'companion', title: 'Сопровождение', description: 'Контакты, условия и доступность помощи' },
  { id: 'quiet', title: 'Спокойный темп', description: 'Протяжённость участков, шум и места пауз' },
  { id: 'family', title: 'Семейная прогулка', description: 'Условия для разных возрастов и сопровождающих' }
]

function notChecked() {
  return {
    status: 'unknown',
    checkedAt: null,
    source: '',
    sourceUrl: '',
    notes: ''
  }
}
function draftPassport(routeId) {
  return {
    routeId,
    overallStatus: 'pending',
    routeCheckedAt: null,
    routeSource: '',
    criteria: Object.fromEntries(
      accessibilityCriteria.map((criterion) => [criterion.id, notChecked()])
    )
  }
}

// Пилотные маршруты пока не обследованы. Вносить сведения только после проверки.
export const routeAccessibilityAudits = {
  vdnh: draftPassport('vdnh'),
  'victory-park': draftPassport('victory-park'),
  'moscow-center': draftPassport('moscow-center')
}
