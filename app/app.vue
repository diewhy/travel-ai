vue
<script setup> 
import {ref, computed, nextTick, onMounted, onBeforeUnmount} from 'vue'


const place = ref('')
const days = ref('')
const budget = ref ('')
const travelType = ref('Активный')
const savedRoutes = ref([])
const result = ref ('')
const formattedResult = computed (() => {
  return result.value
  .replace (/\*\*(.*?)\*\*/g, '<h3>$1</h3>')
  .replace (/\n/g, '<br>')
})
const showPlanner = ref(false)
const destinationImages = {
  'Алтай' : '/places/altai.jpg',
  'Байкал' : '/places/baikal.jpg',
  'Карелия' : '/places/karelia.jpg',
  'Камчатка' : '/places/kamchatka.jpg',
  'Дагестан' : '/places/dagestan.jpg', 
  'Сочи' : '/places/sochi.jpg',
}

const currentDestinationImage = computed(() => {
  return destinationImages[place.value] || '/fon.png'
})

const destinationGalleries = {
  'Алтай' : ['/places/altai.jpg', '/places/altai-2.jpg', '/places/altai-3.jpg'],
  'Байкал' : ['/places/baikal.jpg', '/places/baikal-2.jpg', '/places/baikal-3.jpg'],
  'Карелия' : ['/places/karelia.jpg', '/places/karelia-2.jpg', '/places/karelia-3.jpg'],
  'Камчатка' : ['/places/kamchatka.jpg',  '/places/kamchatka-2.jpg', '/places/kamchatka-3.jpg'],
  'Дагестан' : ['/places/dagestan.jpg',  '/places/dagestan-2.jpg', '/places/dagestan-3.jpg'],
  'Сочи' : ['/places/sochi.jpg',  '/places/sochi-2.jpg', '/places/sochi-3.jpg']
}

const activeImageIndex = ref(0)

let galleryTimer = null

function startGalleryAutoplay () {
  stopGalleryAutoplay ()
  galleryTimer = setInterval(() => {
    if (currentGallery.value.length > 1) {
      activeImageIndex.value =
        (activeImageIndex.value + 1) % currentGallery.value.length
    }
  }, 4000)
}

function stopGalleryAutoplay() {
  if (galleryTimer) {
    clearInterval(galleryTimer)
    galleryTimer = null
  }
}

onMounted(() => {
  startGalleryAutoplay()
  loadSavedRoutes()
})

onBeforeUnmount(() => {
  stopGalleryAutoplay()
})

const currentGallery = computed (() => {
  return destinationGalleries[place.value] || [currentDestinationImage.value]
})
const activeRouteImage = computed (() => {
  return currentGallery.value[activeImageIndex.value]
})

function setRouteImage(index) {
  activeImageIndex.value = index
  startGalleryAutoplay ()
}

function selectDestination(name) {
  place.value = name
  showPlanner.value = true
  result.value = ''
  activeImageIndex.value = 0
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

    saveCurrentRoute()

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

function loadSavedRoutes() {
  const saved = localStorage.getItem('saved-routes')

  if (saved) {
    savedRoutes.value = JSON.parse(saved)
  }
}

function saveCurrentRoute() {
  if (!result.value) return

  const newRoute = {
    place: place.value,
    days: days.value,
    budget: budget.value,
    travelType: travelType.value,
    routeText: result.value,
    date: new Date().toLocaleDateString()
  }

  savedRoutes.value.unshift(newRoute)

  localStorage.setItem(
    'saved-routes',
    JSON.stringify(savedRoutes.value)
  )
}

function openSavedRoute(route) {
  place.value = route.place
  days.value = route.days
  budget.value = route.budget
  travelType.value = route.travelType

  result.value = route.routeText
  showPlanner.value = true
  activeImageIndex.value = 0

  nextTick(() => {
    document
      .querySelector('.result-wrap')
      ?.scrollIntoView({
        behavior: 'smooth'
      })
  })
}

function deleteSavedRoute(index) {
  savedRoutes.value.splice(index, 1)

  localStorage.setItem(
    'saved-routes' ,
    JSON.stringify(savedRoutes.value)
  )
}

async function downloadPdf() {
  const html2pdf = (await import('html2pdf.js')).default

  const element = document.querySelector('.pdf-export')

  if (!element) return

  const options = {
    margin: 10,
    filename: `${place.value || 'route'}-маршрут.pdf`,
    image: {
      type: 'jpeg',
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  }

  html2pdf()
    .set(options)
    .from(element)
    .save()
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
  <div class="route-header route-header-image"
    :style="{backgroundImage: `linear-gradient(rgba(5,15,35,.35), rgba(5,15,35,.88)), url(${activeRouteImage})`}"
    >
    <div class="route-gallery-dots">
  <button
    v-for="(image, index) in currentGallery"
    :key="image"
    type="button"
    class="gallery-line"
    :class="{ active: activeImageIndex === index }"
    @click="setRouteImage(index)"
  ></button>
</div>
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
  <button
    class="pdf-btn"
    @click="downloadPdf"
  >
    📄 Скачать PDF
  </button>
</section>

<div v-if="result" class="pdf-export">
  <h1>Открой Россию</h1>

  <h2>Маршрут по направлению: {{ place }}</h2>

  <p>
    {{ days }} дней • {{ budget }} ₽ • {{ travelType }}
  </p>

  <div v-html="formattedResult"></div>
</div>

<section
  v-if="savedRoutes.length"
  class="saves-routes"  
>
  <h2>Мои маршруты</h2>

  <div
    v-for="(route, index) in savedRoutes"
    :key="route.date + route.place"
    class="saved-route-card"
    @click="openSavedRoute(route)"
  >

  <strong>{{ route.place }}</strong>
  <span>
    {{ route.days }} дн.
  </span>

  <span>
    {{ route.budget }} ₽
  </span>

  <span
    class="delete-route-btn"
    @click.stop="deleteSavedRoute(index)"
  >
    ×
</span>
  
  </div>
</section>
  </div>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Manrope', Arial, sans-serif;
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
  font-family: 'Manrope', Arial, sans-serif;
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
  font-family: 'Manrope', Arial, sans-serif;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 102, 255, 0.35);
}

.result-wrap {
  margin: 60px auto 0;
  padding: 26px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, .15);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.32);
  color: white;
  width: min(100%, 1180px);
  font-family: 'Manrope', Arial, sans-serif;
  overflow: hidden;
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
  letter-spacing: -3px;
  text-shadow: 0 5px 25px rgba(0, 0, 0, 0.45);
  font-family: 'Manrope', Arial, sans-serif;
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

.result-image {
  width: 100%;
  height: 220px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 25px;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit:cover;
  object-position: center;
}

.route-header-image {
  min-height: 260px;
  padding: 28px;
  border-radius: 26px;
  background-size: cover;
  background-position: center;
  margin-bottom: 28px;
  transition: background-image .4s ease, opacity .4s ease;
}

.route-header,
.route-header-image {
  width: 100%;
  min-height: 240px;
  border-radius: 24px;
  background-size: cover;
  background-position: center;
}

.route-header.route-header-image {
  align-items: flex-end;
}

.planner-card h2,
.route-header h2,
.hero-question {
  font-family: 'Manrope', Arial, sans-serif;
  font-weight: 800;
}

.route-gallery-dots {
  display: flex;
  gap: 8px;
  margin: -16px 0 28px;
  position: relative;
  z-index: 20;
}

.gallery-line {
  flex: 1;
  height: 5px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 999px;
  background: rgba(255,255,255,.22);
  cursor: pointer;
  overflow: hidden;
}

.gallery-line.active {
  background: linear-gradient(90deg, #38bdf8, #0ea5e9);
  box-shadow: 0 0 18px rgba(56,189,248,.45);
}

.saved-routes {
  max-width: 1180px;
  margin: 50px auto;
}

.saved-routes h2 {
  color: white;
  margin-bottom: 18px;
}

.saved-route-card {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 16px 20px;
  margin-bottom: 12px;

  border-radius: 16px;

  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);

  cursor: pointer;
}

.saved-route-card:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,.18);
}

.saved-route-card span {
  opacity: .85;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
}

.delete-route-btn {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
  color: white;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.pdf-btn {
  margin-top: 20px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    #2563eb,
    #06b6d4
  );
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.pdf-export {
  position: absolute;
  left: 0;
  top: 0;
  width: 800px;
  padding: 40px;
  background: white;
  color: #111827;
  font-family: 'Manrope', Arial, sans-serif;
  line-height: 1.6;
  z-index: -999;
  opacity: 0;
}

.pdf-export h1 {
  color: #0b2f5b;
  font-size: 34px;
  margin-bottom: 12px;
}

.pdf-export h2 {
  color: #0ea5e9;
  font-size: 24px;
}

.pdf-export h3 {
  color: #2563eb;
  margin-top: 24px;
}
</style>