<script setup>
defineProps({
  userProfile: {
    type: Object,
    required: true
  },

  progressPercent: {
    type: Number,
    default: 0
  }
})

defineEmits(['close'])
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
          {{ userProfile.initials }}
        </div>

        <div>
          <span>Личный кабинет</span>
          <h2>{{ userProfile.name }}</h2>
          <p>{{ userProfile.role }}</p>
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
    </aside>
  </div>
</template>
