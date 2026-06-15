export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const prompt = `
Составь краткий маршрут по России.

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
Пиши кратко.
`

  const response = await fetch('https://apinet.cloud/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  const data = await response.json()

  return {
    route: data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2)
  }
})