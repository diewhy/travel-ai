import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  })

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    max_output_tokens: 1200,
    temperature: 0.7,
    input: `
Составь краткий маршрут путешествия.

Место: ${body.place}
Количество дней: ${body.days}
Бюджет: ${body.budget} рублей
Тип отдыха: ${body.travelType}

Ответь на русском языке.
Формат:
День 1:
- места
- расходы
- совет

Пиши кратко, без вступления.
`
  })

  return {
    route: response.output_text
  }
}) 