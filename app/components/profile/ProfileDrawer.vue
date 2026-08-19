<script setup>
defineProps({
  userProfile: {
    type: Object,
    required: true
  },

  progressPercent: {
    type: Number,
    default: 0
  },

  logoutLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'close',
  'logout'
])
</script>

<template>
  <div
    class="profile-drawer-overlay"
    @click.self="$emit('close')"
  >
    <aside class="profile-drawer">
      <button
        type="button"
        class="profile-drawer-close"
        @click="$emit('close')"
      >
        ×
      </button>

      <div class="profile-drawer-head">
        <div class="profile-drawer-avatar">
          <img
            v-if="userProfile.avatarUrl"
            :src="userProfile.avatarUrl"
            :alt="userProfile.name"
            referrerpolicy="no-referrer"
          >

          <span v-else>
            {{ userProfile.initials }}
          </span>
        </div>

        <div class="profile-drawer-identity">
          <span>Личный кабинет</span>
          <h2>{{ userProfile.name }}</h2>
          <p>{{ userProfile.role }}</p>

          <div class="profile-auth-meta">
            <small v-if="userProfile.authProvider">
              {{ userProfile.authProvider }}
            </small>

            <small v-if="userProfile.email">
              {{ userProfile.email }}
            </small>
          </div>
        </div>
      </div>

      <div class="profile-level-card">
        <div class="profile-level-top">
          <strong>Уровень {{ userProfile.level }}</strong>

          <span>
            {{ userProfile.points }} /
            {{ userProfile.nextLevelPoints }} баллов
          </span>
        </div>

        <div class="profile-level-line">
          <div
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <div class="profile-mini-stats">
        <article>
          <strong>{{ userProfile.routesCompleted }}</strong>
          <span>маршрута</span>
        </article>

        <article>
          <strong>{{ userProfile.tasksCompleted }}</strong>
          <span>заданий</span>
        </article>

        <article>
          <strong>{{ userProfile.photosUploaded }}</strong>
          <span>фото</span>
        </article>

        <article>
          <strong>{{ userProfile.reviewsLeft }}</strong>
          <span>отзывов</span>
        </article>
      </div>

      <section class="profile-task-preview">
        <span>Задания от РВИО</span>

        <h3>
          Сфотографируйтесь на локации
        </h3>

        <p>
          Пользователь приходит на точку маршрута, делает фото,
          загружает его в платформу и получает баллы. Эти фотографии
          потом можно использовать как презентацию локации.
        </p>

        <div class="task-reward">
          +50 баллов
        </div>
      </section>

      <section class="profile-task-preview">
        <span>Отзывы о точках</span>

        <h3>
          Оставьте впечатление о месте
        </h3>

        <p>
          После посещения точки пользователь сможет поставить оценку,
          написать отзыв и добавить фото.
        </p>

        <div class="task-reward">
          +15 баллов
        </div>
      </section>

      <button
        type="button"
        class="profile-logout-btn"
        :disabled="logoutLoading"
        @click="$emit('logout')"
      >
        {{
          logoutLoading
            ? 'Выходим…'
            : 'Выйти из аккаунта'
        }}
      </button>
    </aside>
  </div>
</template>
