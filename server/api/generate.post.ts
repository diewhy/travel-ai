import { parse } from 'vue/compiler-sfc'
import { moscowArtPlaces } from '../data/moscowArtPlaces.js'
import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const isHistoryMode = body.mode === 'history'
  const config = useRuntimeConfig()
  const isMoscowArtMode = body.mode === 'moscowArt'

  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  })

  const travelPrompt = `
Ты — AI-помощник для путешествий по России.

Составь понятный и полезный туристический маршрут путешествия.

Данные пользователя:
Место: ${body.place}
Количество дней: ${body.days}
Бюджет: ${body.budget} рублей
Тип отдыха: ${body.travelType}

Требования:
- Ответь только на русском языке.
- Не пиши вступление.
- Не выдумывай слишком фантастические места.
- Учитывай бюджет.
- Маршрут должен быть реалистичным.
- Каждый день должен быть отдельным блоком.
- В каждом дне укажи места, примерные расходы и совет.
- В конце укажи примерный итоговый бюджет.
- Пиши красиво, но кратко.

Формат строго такой:

**День 1 — название дня**
📍  Места:
- место 1
- место 2

💰 Расходы:
- транспорт: примерно ... ₽
- питание: примерно ... ₽
- активности: примерно ... ₽

💡  Совет:
краткий совет

**Итоговый бюджет**
примерно ... ₽

**Общий совет**
краткий совет для поездки

Верни ответ строго в JSON формате:
{
  "route": "полный туристический маршрут",
  "history": "",
  "memoryPlaces": [],
  "mapPoints": [
    "место 1",
    "место 2",
    "место 3"
  ]
}

Никакого текста вне JSON не добавляй.
`

  const historyPrompt = `
Ты — AI-помощник по городам воинской славы России.

Составь военно-исторический маршрут по городу.

Данные пользователя:
Город: ${body.place}
Количество дней: ${body.days}
Бюджет: ${body.budget} рублей
Тип отдыха: ${body.travelType}

Требования:
- Ответь только на русском языке.
- Не пиши вступление.
- Сделай акцент на истории, памяти, памятниках, мемориалах и музеях.
- Не выдумывай несуществующие объекты.
- Маршрут должен быть реалистичным.
- Каждый день должен быть отдельным блоком.
- В каждом дне укажи места, примерные расходы и совет.
- В конце укажи примерный итоговый бюджет.
- Пиши красиво, но кратко.

Обязательно добавь:
- краткую историческую справку о городе;
- памятные места;
- музеи;
- мемориалы;
- военно-исторический маршрут.

Формат маршрута:

**День 1 — название дня**
📍  Места:
- место 1
- место 2

💰 Расходы:
- транспорт: примерно ... ₽
- питание: примерно ... ₽
- активности: примерно ... ₽

💡  Совет:
краткий совет

**Итоговый бюджет**
примерно ... ₽

**Общий совет**
краткий совет для поездки

Верни ответ строго в JSON формате:
{
  "route": "полный военно-исторический маршрут по дням",
  "history": "краткая историческая справка о городе на 4-6 предложений",
  "memoryPlaces": [
    "памятное место 1",
    "памятное место 2",
    "памятное место 3"
  ],
  "mapPoints": [
    "место 1",
    "место 2",
    "место 3"
  ]
}

Никакого текста вне JSON не добавляй.
`
const selectedMoscowPlaces = moscowArtPlaces
  .filter ((item) =>
    item.name.toLowerCase().includes(String(body.place).toLowerCase()
))

const moscowArtPlacesForPrompt = 
  selectedMoscowPlaces.length > 0
  ? selectedMoscowPlaces
  : moscowArtPlaces.slice (0, 6)

const moscowArtPrompt = `
Ты — AI-помощник проекта «Москва в красках».

Составь художественный маршрут по Москве для открытого пленэра.

Данные пользователя:
Локация: ${body.place}
Количество дней: ${body.days}
Бюджет: ${body.budget} рублей

Доступные художественные точки Москвы:

${JSON.stringify(moscowArtPlacesForPrompt, null, 2)}

Используй ТОЛЬКО эти точки при построении маршрута.
Не придумывай новые объекты

Требования:
- Ответь только на русском языке.
- Сделай акцент на культурном наследии Москвы.
- Объясни, почему место интересно для рисования.
- Добавь историческую справку.
- Укажи лучшие точки для пленэра.
- Укажи, что взять с собой.
- Составь маршрут по дням.
- Не выдумывай несуществующие объекты.
- Пиши красиво, но кратко.

Верни ответ СТРОГО в JSON.

{
  "route": "Полный художественный маршрут по дням",
  "history": "Краткая информация о выбранной локации",
  "memoryPlaces": [
    "Что будем рисовать 1",
    "Что будем рисовать 2",
    "Что будем рисовать 3"
  ],
  "mapPoints": [
    "Точка 1",
    "Точка 2",
    "Точка 3"
  ]
}

"route": "ВАЖНО: это должнап быть одна строка текста, не объект и не массив. Внутри строки оформи пленэры через переносы строк."
Никакого текста вне JSON не добавляй.
`

  const prompt =
  isMoscowArtMode
    ? moscowArtPrompt
    : isHistoryMode
      ? historyPrompt
      : travelPrompt

const response = await openai.responses.create({
  model: 'gpt-4.1-mini',
  max_output_tokens: 2500,
  temperature: 0.7,
  input: prompt
})
  const rawText = response.output_text || ''

  const cleanText = rawText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

let parsed

try {
  parsed = JSON.parse(cleanText)
} catch (error) {
  console.error('JSON PARSE ERROR:', cleanText)

  return {
    route: cleanText,
    history: '',
    memoryPlaces: [],
    mapPoints: []
  }
}

const routeText =
  typeof parsed.route === 'string'
    ? parsed.route
    : JSON.stringify(parsed.route, null, 2)

console.log(parsed)
    
return {
  route: routeText,
  history: parsed.history || '',
  memoryPlaces: Array.isArray(parsed.memoryPlaces) ? parsed.memoryPlaces : [],
  mapPoints: Array.isArray(parsed.mapPoints) ? parsed.mapPoints : [],

  title: parsed.title || '',
  about: parsed.about || '',
  pleinairs: Array.isArray(parsed.pleinairs) ? parsed.pleinairs : [],
  equipment: Array.isArray(parsed.equipment) ? parsed.equipment : [],
  summary: parsed.summary || ''
}
})