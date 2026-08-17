<script setup>
defineProps({
  routes: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'open-route',
  'delete-route'
])
</script>

<template>
  <section class="saves-routes">
    <h2>Мои маршруты</h2>

    <div
      v-for="(route, index) in routes"
      :key="`${route.date}-${route.place}-${index}`"
      class="saved-route-card"
      @click="$emit('open-route', route)"
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
        @click.stop="$emit('delete-route', index)"
      >
        ×
      </span>
    </div>
  </section>
</template>
