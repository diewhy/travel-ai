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
<main class="hero center-hero">
  <section class="hero-center">
    <img src="/logo.png" alt="Открой Россию" class="main-logo" />
  
    <h1 class="hero-title">Открой Россию</h1>
    <p class="hero-subtitle">Путешествия начинаются здесь</p>
    <div class="stats">
      <div><strong>89</strong><span>регионов</span></div>
      <div><strong>500+</strong><span>маршрутов</span></div>
      <div><strong>AI</strong><span>генерация</span></div>
    </div>

    <div class="badge">Новый способ планировать путешествия</div>

    <h2 class="hero-question">
      Куда хотите отправиться?
    </h2>

    <div class="destinations">
  <div class="destination-card altai" @click="place = 'Алтай'">
    <span>🏔</span>
    <strong>Алтай</strong>
  </div>

  <div class="destination-card baikal" @click="place = 'Байкал'">
    <span>🌊</span>
    <strong>Байкал</strong>
  </div>

  <div class="destination-card karelia" @click="place = 'Карелия'">
    <span>🌲</span>
    <strong>Карелия</strong>
  </div>

  <div class="destination-card kamchatka" @click="place = 'Камчатка'">
    <span>🌋</span>
    <strong>Камчатка</strong>
  </div>

  <div class="destination-card dagestan" @click="place = 'Дагестан'">
    <span>⛰</span>
    <strong>Дагестан</strong>
  </div>

  <div class="destination-card sochi" @click="place = 'Сочи'">
    <span>🌴</span>
    <strong>Сочи</strong>
  </div>
</div>

    <section class="planner-card">
      <h2>Собрать маршрут</h2>

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
    </section>
  </section>
</main>

    <section v-if="result" class="result-wrap">
      <div class="result-title">Ваш маршрут готов</div>
      <div class="result" v-html="formattedResult"></div>
    </section>
  </div>
</template>


<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 30%),
    linear-gradient(135deg, #071a3a 0%, #0b2f5b 45%, #9b1c31 100%);
  min-height: 100vh;
}

.page {
  min-height: 100vh;
  padding: 28px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page ::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: #1d7cf2;
  filter: blur(180px);
  opacity: .25;
  top: -150px;
  left: -150px;
  pointer-events: none;
  z-index: 0;
}

.page ::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: #ff2d55;
  filter: blur(180px);
  opacity: .20;
  top: -200;
  left: -150px;
  pointer-events: none;
  z-index: 0;
}

.topbar {
  max-width: 1180px;
  margin: 0 auto 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  width: 170px;
}

.nav {
  opacity: 0.8;
  font-size: 14px;
}

.hero {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 42px;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  margin-bottom: 22px;
  font-size: 14px;
}

h1 {
  font-size: 72px;
  line-height: 0.95;
  margin: 0 0 24px;
  letter-spacing: -2px;
}

.subtitle {
  font-size: 21px;
  line-height: 1.55;
  max-width: 620px;
  opacity: 0.92;
}

.popular {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 34px;
}

.popular span {
  padding: 12px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: 0.2s;
  font-weight: 700;
}

.popular span:hover {
  background: white;
  color: #0b2f5b;
  transform: translateY(-2px);
}

.planner-card {
  width: 700px;
  margin: 34px auto 0;
  padding: 30px;
  border-radius: 30px;
  background: rgba(255,255,255,.14);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,.22);
  box-shadow: 0 28px 90px rgba(0,0,0,.32);
  color: white;
  text-align: left;
  max-width: 90vw;
}

.planner-card h2 {
  margin: 0 0 22px;
  font-size: 28px;
  color: white;
  text-align: center;
}

input,
select {
  width: 100%;
  padding: 16px 18px;
  margin-top: 14px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  outline: none;
  background: rgba(225,225,225,.94);
  color: #0f172a;
}

input:focus,
select:focus {
  border-color: #9b1c31;
  box-shadow: 0 0 0 3px rgba(155, 28, 49, 0.12);
}

button {
  width: 100%;
  margin-top: 18px;
  padding: 17px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #0066ff, #00a3ff);
  color: white;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 102, 255, 0.35);
}

.result-wrap {
  margin-top: 40px;
  backdrop-filter: blur(20px);
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  color: white;
}

.result-title {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 18px;
  color: #9b1c31;
}

.result {
  line-height: 1.75;
  font-size: 16px;
}

.result h3 {
  margin-top: 24px;
  color: #0b2f5b;
}

@media (max-width: 860px) {
  .topbar {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 48px;
  }

  .page {
    padding: 20px;
  }
}

.center-hero {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: calc(100vh - 120px);
}

.hero-center {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.main-logo {
  width: 300px !important;
  max-width: none;
  height: auto;
  display: block;
  filter: drop-shadow(0 18px 45px rgba(0, 0, 0, 0.38));
  margin: 0 auto 18px;
}

.hero-title {
  font-size: 72px;
  font-weight: 900;
  color: white;
  margin: 0;
  line-height: 1;
  letter-spacing: -1px;
  text-shadow: 0 14px 50px rgba(0, 0, 0, 0.35);
}

.hero-subtitle {
  font-size: 30px;
  color: rgba(255,255,255,.88);
  margin: 0 0 26px;
  font-weight: 600;
  margin-bottom: 40px;
  margin-top: 12px;
}

.popular {
  justify-content: center;
  margin: 28px 0 30px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 30px 0 40px;
  margin-top: 35px;
  margin-bottom: 35px;
}

.stats div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats strong {
  font-size: 42px;
  color: white;
  font-weight: 900;
}

.stats span {
  color: rgba(225,225,225,.75);
  font-size: 14px;
}

.hero-question {
  font-size: 32px;
  font-weight: 800;
  margin: 50px 0 25px;
  color: white;
}

.destinations {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  max-width: 760px;
  margin: 28px auto 34px;
}

.destination-card {
  position: relative;
  height: 105px;
  border-radius: 22px;
  padding: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  color: white;
  border: 1px solid rgba(255,255,255,.24);
  box-shadow: 0 18px 45px rgba(0,0,0,.22);
  transition: .25s;
}

.destination-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.62));
  z-index: 1;
}

.destination-card span,
.destination-card strong {
  position: relative;
  z-index: 2;
}

.destination-card span {
  font-size: 24px;
  margin-bottom: 6px;
}

.destination-card strong {
  font-size: 18px;
}

.destination-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 25px 65px rgba(0,0,0,.32);
}

.altai {
  background: linear-gradient(135deg, #0f766e, #38bdf8);
}

.baikal {
  background: linear-gradient(135deg, #075985, #0ea5e9);
}

.karelia {
  background: linear-gradient(135deg, #14532d, #22c55e);
}

.kamchatka {
  background: linear-gradient(135deg, #7f1d1d, #f97316);
}

.dagestan {
  background: linear-gradient(135deg, #78350f, #f59e0b);
}

.sochi {
  background: linear-gradient(135deg, #064e3b, #06b6d4);
}

@media (max-width: 700px) {
  .destinations {
    grid-template-columns: repeat(2, 1fr);
  }

  .destination-card {
    height: 95px;
  }
}
</style>