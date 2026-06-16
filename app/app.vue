vue
<script setup> 
import {nextTick} from 'vue'

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
const showPlanner = ref(false)
function selectDestination(name) {
  place.value = name
  showPlanner.value = true
}

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

    await nextTick ()

    document
      .querySelector ('.result-wrap')
      ?.scrollIntoView ({
        behavior: 'smooth'
      })
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
    <Transition name="fade">
      <div v-if="!showPlanner">
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
  <div class="destination-card altai" @click="selectDestination('Алтай')">
    <span>🏔</span>
    <strong>Алтай</strong>
  </div>

  <div class="destination-card baikal" @click="selectDestination('Байкал')">
    <span>🌊</span>
    <strong>Байкал</strong>
  </div>

  <div class="destination-card karelia" @click="selectDestination('Карелия')">
    <span>🌲</span>
    <strong>Карелия</strong>
  </div>

  <div class="destination-card kamchatka" @click="selectDestination('Камчатка')">
    <span>🌋</span>
    <strong>Камчатка</strong>
  </div>

  <div class="destination-card dagestan" @click="selectDestination('Дагестан')">
    <span>⛰</span>
    <strong>Дагестан</strong>
  </div>

  <div class="destination-card sochi" @click="selectDestination('Сочи')">
    <span>🌴</span>
    <strong>Сочи</strong>
  </div>
</div>
</div>
</Transition>

    <transition name="slide-up">
      <section v-if="showPlanner" class="planner-card">
        <button class="close-btn" @click="showPlanner = false; result = ''; days = ''; budget = ''">×</button>
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
    </transition>
  </section>
</main>

    <section v-if="result" class="result-wrap">
  <div class="route-header">
    <div>
      <p class="route-label">Ваш маршрут готов</p>
      <h2>Маршрут по направлению: {{ place || 'Россия' }}</h2>
    </div>

    <div class="route-stats">
      <span>📅 {{ days || '—' }} дней</span>
      <span>💰 {{ budget || '—' }} ₽</span>
      <span>🧭 {{ travelType }}</span>
    </div>
  </div>

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
    linear-gradient(rgba(4, 15, 35, 0.72), rgba(4, 15, 35, 0.82)
    ),
    url('/fon.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;  
  min-height: 100vh;
}

.page {
  min-height: 100vh;
  padding: 28px;
  color: white;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(5,15,35,0.55);
  z-index: -1;
}

.planner-card,
.result-wrap {
  position: relative;
  z-index: 20;
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
  width: 100%;
  margin: 34px auto 0;
  padding: 30px;
  border-radius: 30px;
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  color: white;
  text-align: left;
  max-width: 760px;
  position: relative;
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
  max-width: 1000px;
  margin: 50px auto 0;
  padding: 34px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, .15);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.32);
  color: white;
  width: 90%;
}

.route-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.route-label {
  margin: 0 0 8px;
  color: #38bdf8;
  font-weight: 800;
  font-size: 15px;
}

.route-header h2 {
  margin: 0;
  font-size: 42px;
  line-height: 1.15;
}

.route-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.route-stats span {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-weight: 700;
  white-space: nowrap;
}

.result {
  line-height: 1.8;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.94);
}

.result h3 {
  margin: 26px 0 14px;
  padding: 18px 22px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(0, 102, 255, 0.28), rgba(0, 163, 255, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  font-size: 24px;
}

@media (max-width: 700px) {
  .route-header {
    flex-direction: column;
  }

  .route-stats {
    justify-content: flex-start;
  }

  .route-header h2 {
    font-size: 26px;
  }

  .result-wrap {
    padding: 22px;
  }
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
  align-items: flex-start;
  text-align: center;
  min-height: auto;
  padding-top: 40px;
}

.hero-center {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeUp .8s ease;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  text-shadow: 0 5px 25px rgba(0, 0, 0, 0.45);
}

.hero-subtitle {
  font-size: 30px;
  color: rgba(255,255,255,.88);
  margin: 0 0 26px;
  font-weight: 600;
  margin-bottom: 40px;
  margin-top: 12px;
  text-shadow: 0 3px 15px rgba(0, 0, 0, 0.35);
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

.fade-enter-active,
.fade-leave-active {
  transition: .4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: .5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.close-btn,
.back-btn {
  position: absolute;
  top: 22px;
  right: 22px;

  width: 42px;
  height: 42px;
  padding: 0;
  margin: 0;

  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.12);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  box-shadow: none;
}
</style>