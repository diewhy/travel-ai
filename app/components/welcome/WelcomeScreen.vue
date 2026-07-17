<script setup>
defineEmits(['enter', 'preview'])
</script>

<template>
  <section class="welcome-screen">
    <div class="welcome-bg-glow"></div>

    <div class="welcome-content">
      <div class="welcome-logo-row">
        <img
          src="/logo222.png"
          alt="Открой Россию"
        >

        <div>
          <strong>Открой Россию</strong>
          <span>Память · маршруты · культура</span>
        </div>
      </div>

      <span class="welcome-chip">
        Цифровая платформа исторических маршрутов
      </span>

      <h1>
        Историю нельзя просто прочитать.
        Её нужно пройти.
      </h1>

      <p>
        Интерактивные военно-исторические маршруты по Москве
        и Московской области: карта, аудиогид, задания на точках,
        баллы, отзывы и личный кабинет участника.
      </p>

      <div class="welcome-actions">
        <button
          type="button"
          class="welcome-main-btn"
          @click="$emit('enter')"
        >
          Войти в платформу
        </button>

        <button
          type="button"
          class="welcome-route-btn"
          @click="$emit('preview')"
        >
          Посмотреть готовый маршрут
        </button>
      </div>

      <div class="welcome-features">
        <article>
          <strong>3</strong>
          <span>готовых маршрута</span>
        </article>

        <article>
          <strong>23</strong>
          <span>исторические точки</span>
        </article>

        <article>
          <strong>РВИО</strong>
          <span>задания за баллы</span>
        </article>
      </div>
    </div>

    <div class="welcome-preview-card">
      <span>Демо-маршрут</span>

      <h2>Москва. Дорогами памяти</h2>

      <p>
        Александровский сад, Могила Неизвестного Солдата,
        Вечный огонь, Пост №1 и Красная площадь.
      </p>

      <div>
        <small>2–3 часа</small>
        <small>6 точек</small>
        <small>Аудиогид</small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.welcome-screen {
  min-height: calc(100vh - 56px);
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 46px;
  position: relative;
  overflow: hidden;
  border-radius: 38px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  background:
    radial-gradient(
      circle at 78% 18%,
      rgba(56, 189, 248, 0.24),
      transparent 30%
    ),
    radial-gradient(
      circle at 8% 100%,
      rgba(250, 204, 21, 0.13),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      rgba(8, 31, 70, 0.98),
      rgba(7, 78, 128, 0.92)
    );
  box-shadow: 0 34px 110px rgba(0, 14, 42, 0.42);
}

.welcome-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 82px,
      rgba(255, 255, 255, 0.026) 83px
    );
  pointer-events: none;
}

.welcome-content {
  position: relative;
  z-index: 2;
  width: min(100%, 740px);
}

.welcome-preview-card {
  position: relative;
  z-index: 2;
  flex: 0 0 380px;
  padding: 28px;
  border-radius: 30px;
  transform: translateY(-10px);
  background: rgba(5, 20, 49, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.32);
}

.welcome-logo-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.welcome-logo-row img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  filter: drop-shadow(0 16px 32px rgba(0, 0, 0, 0.28));
}

.welcome-logo-row strong,
.welcome-logo-row span {
  display: block;
}

.welcome-logo-row strong {
  color: white;
  font-size: 25px;
  font-weight: 900;
  line-height: 1.1;
}

.welcome-logo-row span {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.64);
  font-size: 13px;
}

.welcome-chip {
  display: inline-flex;
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(250, 204, 21, 0.14);
  border: 1px solid rgba(250, 204, 21, 0.28);
  color: #fde68a;
  font-size: 12px;
  font-weight: 900;
}

.welcome-content h1 {
  max-width: 760px;
  margin: 22px 0 18px;
  color: white;
  font-size: clamp(50px, 6vw, 82px);
  line-height: 1.02;
  letter-spacing: -0.06em;
}

.welcome-content p {
  max-width: 720px;
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 18px;
  line-height: 1.72;
}

.welcome-actions {
  margin-top: 34px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.welcome-main-btn,
.welcome-route-btn {
  width: auto;
  min-height: 56px;
  margin: 0;
  padding: 0 24px;
  border-radius: 17px;
  font-size: 15px;
  font-weight: 900;
}

.welcome-main-btn {
  color: #111827;
  background: linear-gradient(90deg, #facc15, #f97316);
}

.welcome-route-btn {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.welcome-features {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 760px;
}

.welcome-features article {
  min-height: 96px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.welcome-features strong,
.welcome-features span {
  display: block;
}

.welcome-features strong {
  color: #7dd3fc;
  font-size: 30px;
  line-height: 1;
}

.welcome-features span {
  margin-top: 7px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
  line-height: 1.3;
}

.welcome-preview-card > span {
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.welcome-preview-card h2 {
  margin: 12px 0;
  color: white;
  font-size: 28px;
  line-height: 1.22;
}

.welcome-preview-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.65;
  font-size: 14px;
}

.welcome-preview-card div {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.welcome-preview-card small {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1050px) {
  .welcome-screen {
    align-items: flex-start;
    flex-direction: column;
  }

  .welcome-preview-card {
    flex: none;
    width: min(100%, 520px);
  }
}

@media (max-width: 760px) {
  .welcome-screen {
    min-height: auto;
    padding: 28px 22px;
    border-radius: 30px;
  }

  .welcome-content h1 {
    font-size: 42px;
    letter-spacing: -0.04em;
  }

  .welcome-features {
    grid-template-columns: 1fr;
  }
}
</style>
