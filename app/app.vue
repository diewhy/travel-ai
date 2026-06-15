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
    result.value = 'Ошибка фронтенд:' + JSON.stringify(error, null, 2)
  }
}

</script>

<template> 
 <div class="container">
    <h1> AI Travel Planner</h1>
    <p> Планировщик путешествий по России </p>

    <input 
      v-model="place" 
      placeholder="Куда хотите поехать?"
    />
    
    <input 
      v-model="days" 
      placeholder="Сколько дней?"
    />
    
    <input 
      v-model="budget" 
      placeholder="Бюджет"
    />

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

    <div v-if="result" class="result" v-html="formattedResult"></div>
 </div>
</template>


<style>
body {
  margin: 0;
  background: #f5f5f5;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 800px;
  margin: 50px auto;
  background: white;
  padding: 30px;
  border-radius: 20px;
}

h1 {
  margin-bottom: 10px;
}

input {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  box-sizing: border-box;
}

button {
  width: 100%;
  margin-top: 15px;
  padding: 14px;
  border: none;
  background: black;
  color: white;
  cursor: pointer;
}

.result {
  margin-top: 20px;
  background: #f3f3f3;
  padding: 20px;
  border-radius: 10px;
  line-height: 1.6;
}

.result h3 {
  margin-top: 30 px;
  padding: 25px;
  background: #f8f8f8;
  border-radius: 12px;
  white-space: pre-wrap;
  line-height: 1.8;
}

input,
select {
  width: 100%;
  padding: 14px;
  margin-top: 14px;
  box-sizing: border-box;
  border: 1px solid #999;
  border-radius: 6px;
}
</style>