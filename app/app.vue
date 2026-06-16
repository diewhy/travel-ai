vue
<script setup> 
const place = ref('')
const days = ref('')
const budget = ref ('')
const travelType = ref('Активный')
const result = ref ('')
const formattedResult = computed (() => {
  return result.value
  .replace (/\*\*(.*?)\*\*/g, '<h3>$1</h3>')
  .replace (/\n/g, '<br>')
})

async function generateRoute() {
  result.value = 'Генерируем маршрут, подождите 10-20 секунд...'

  if (Number(days.value) > 7) {
    result.value = 'Пока доступна генерация маршрутов до 7 дней'
    return
  }

  try {
    const response = await $fetch ('/api/generate',{
      method: 'POST' ,
      body: {
        place: place.value,
        days: days.value,
        budget: budget.value,
        travelType: travelType.value
      }
    })

    result.value = response.route
  } catch (error) {
    result.value = 'Ошибка:' + (error?.data?.message || error?.message || 'неизвестная ошибка')
  }
}

</script>

<template>
  <div class="page">
    <div class="hero">
      <div class="badge">🇷🇺 AI-путешествия по России</div>

      <h1>Открой Россию</h1>
      <p class="subtitle">
        Спланируйте маршрут по России за несколько секунд: направление, бюджет, дни и формат отдыха.
      </p>

      <div class="popular">
        <span @click="place = 'Алтай'">Алтай</span>
        <span @click="place = 'Байкал'">Байкал</span>
        <span @click="place = 'Карелия'">Карелия</span>
        <span @click="place = 'Камчатка'">Камчатка</span>
        <span @click="place = 'Дагестан'">Дагестан</span>
        <span @click="place = 'Сочи'">Сочи</span>
      </div>

      <div class="card">
        <input v-model="place" placeholder="Куда хотите поехать?" />

        <input v-model="days" placeholder="Сколько дней?" />

        <input v-model="budget" placeholder="Бюджет, ₽" />

        <select v-model="travelType">
          <option value="Активный">Активный отдых</option>
          <option value="Семейный">Семейный отдых</option>
          <option value="Автомобильный">Автопутешествие</option>
          <option value="Гастрономический">Гастротур</option>
          <option value="Эконом">Эконом</option>
          <option value="Люкс">Люкс</option>
        </select>

        <button @click="generateRoute">
          Сгенерировать маршрут
        </button>
      </div>

      <div v-if="result" class="result" v-html="formattedResult"></div>
    </div>
  </div>
</template>


<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background:
    linear-gradient(135deg, rgba(12, 74, 110, 0.9), rgba(15, 23, 42, 0.95)),
    url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

.page {
  min-height: 100vh;
  padding: 50px 20px;
  box-sizing: border-box;
}

.hero {
  max-width: 920px;
  margin: 0 auto;
  color: white;
}

.badge {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  margin-bottom: 20px;
  font-size: 14px;
}

h1 {
  font-size: 56px;
  margin: 0 0 12px;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 20px;
  max-width: 650px;
  line-height: 1.5;
  opacity: 0.9;
}

.popular {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 28px 0;
}

.popular span {
  background: rgba(255, 255, 255, 0.16);
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s;
}

.popular span:hover {
  background: rgba(255, 255, 255, 0.3);
}

.card {
  background: white;
  padding: 26px;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  margin-top: 24px;
}

input,
select {
  width: 100%;
  padding: 15px;
  margin-top: 14px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
}

button {
  width: 100%;
  margin-top: 18px;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: #0f172a;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.result {
  margin-top: 28px;
  background: rgba(255, 255, 255, 0.96);
  color: #111827;
  padding: 28px;
  border-radius: 24px;
  line-height: 1.7;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.22);
}

.result h3 {
  margin-top: 24px;
  color: #0f172a;
}

@media (max-width: 700px) {
  h1 {
    font-size: 40px;
  }

  .subtitle {
    font-size: 17px;
  }

  .page {
    padding: 30px 14px;
  }
}
</style>