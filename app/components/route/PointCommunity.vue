<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

const props = defineProps({
  stop: {
    type: Object,
    required: true
  },

  user: {
    type: Object,
    default: null
  },

  userProfile: {
    type: Object,
    default: () => ({})
  },

  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'request-auth',
  'profile-changed'
])

const { $supabase } = useNuxtApp()

const loading = ref(false)
const photoUploading = ref(false)
const reviewSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const photos = ref([])
const reviews = ref([])
const pointEnabled = ref(true)
const fileInput = ref(null)

const reviewRating = ref(5)
const reviewText = ref('')

function createPointKey(name) {
  return String(name || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const pointKey = computed(() =>
  createPointKey(props.stop?.name)
)

const currentUserId = computed(() =>
  props.user?.id || ''
)

const myPhoto = computed(() =>
  photos.value.find(
    (item) =>
      item.user_id === currentUserId.value
  ) || null
)

const myReview = computed(() =>
  reviews.value.find(
    (item) =>
      item.user_id === currentUserId.value
  ) || null
)

const averageRating = computed(() => {
  if (!reviews.value.length) return 0

  const sum = reviews.value.reduce(
    (total, item) =>
      total + Number(item.rating || 0),
    0
  )

  return Number(
    (sum / reviews.value.length).toFixed(1)
  )
})

const averageStars = computed(() =>
  Math.round(averageRating.value)
)

function starString(rating) {
  const value = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  )

  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`
}

function formatDate(value) {
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat(
      'ru-RU',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    ).format(new Date(value))
  } catch {
    return ''
  }
}

function initials(name) {
  const parts = String(name || 'П')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return parts
    .slice(0, 2)
    .map((item) =>
      item[0]?.toUpperCase() || ''
    )
    .join('') || 'П'
}

function storagePhotoUrl(path) {
  if (!$supabase || !path) return ''

  const { data } = $supabase.storage
    .from('point-photos')
    .getPublicUrl(path)

  return data?.publicUrl || ''
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function loadCommunity(preserveMessages = false) {
  if (!$supabase || !pointKey.value) return

  loading.value = true

  if (!preserveMessages) {
    clearMessages()
  }

  try {
    const {
      data: catalogPoint,
      error: catalogError
    } = await $supabase
      .from('point_catalog')
      .select('point_key')
      .eq('point_key', pointKey.value)
      .maybeSingle()

    if (catalogError) {
      throw catalogError
    }

    pointEnabled.value = Boolean(catalogPoint)

    if (!pointEnabled.value) {
      photos.value = []
      reviews.value = []
      return
    }

    const [photosResult, reviewsResult] =
      await Promise.all([
        $supabase
          .from('point_photos')
          .select(
            'id, user_id, storage_path, display_name, avatar_url, created_at'
          )
          .eq('point_key', pointKey.value)
          .order('created_at', {
            ascending: false
          })
          .limit(12),

        $supabase
          .from('point_reviews')
          .select(
            'id, user_id, rating, review_text, display_name, avatar_url, created_at, updated_at'
          )
          .eq('point_key', pointKey.value)
          .order('created_at', {
            ascending: false
          })
          .limit(100)
      ])

    if (photosResult.error) {
      throw photosResult.error
    }

    if (reviewsResult.error) {
      throw reviewsResult.error
    }

    photos.value = (
      photosResult.data || []
    ).map((item) => ({
      ...item,
      url: storagePhotoUrl(
        item.storage_path
      )
    }))

    reviews.value = reviewsResult.data || []

    const existingReview =
      reviews.value.find(
        (item) =>
          item.user_id === currentUserId.value
      )

    if (existingReview) {
      reviewRating.value =
        Number(existingReview.rating) || 5
      reviewText.value =
        existingReview.review_text || ''
    } else {
      reviewRating.value = 5
      reviewText.value = ''
    }
  } catch (error) {
    console.error(
      '[Community] Ошибка загрузки:',
      error
    )

    errorMessage.value =
      error?.message ||
      'Не удалось загрузить отзывы и фотографии.'
  } finally {
    loading.value = false
  }
}

function requireAuth() {
  if (props.isAuthenticated) return true

  emit('request-auth')
  return false
}

function choosePhoto() {
  clearMessages()

  if (!requireAuth()) return
  if (!pointEnabled.value) return
  if (myPhoto.value) return

  fileInput.value?.click()
}

async function uploadPhoto(event) {
  const input = event?.target
  const file = input?.files?.[0]

  if (input) {
    input.value = ''
  }

  if (!file || !$supabase) return
  if (!requireAuth()) return
  if (myPhoto.value) return

  clearMessages()

  if (!String(file.type).startsWith('image/')) {
    errorMessage.value =
      'Можно загрузить только фотографию.'
    return
  }

  const maxSize = 10 * 1024 * 1024

  if (file.size > maxSize) {
    errorMessage.value =
      'Фотография должна быть не больше 10 МБ.'
    return
  }

  photoUploading.value = true

  let uploadedPath = ''

  try {
    const originalExtension =
      String(file.name || '')
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || ''

    const mimeExtension =
      file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : file.type.includes('heic')
            ? 'heic'
            : file.type.includes('heif')
              ? 'heif'
              : 'jpg'

    const extension =
      originalExtension || mimeExtension

    const randomId =
      typeof crypto !== 'undefined' &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`

    // Storage object keys keep only ASCII-safe segments.
    // The point relation itself is stored in point_photos.point_key.
    uploadedPath =
      `${props.user.id}/${randomId}.${extension}`

    const {
      error: uploadError
    } = await $supabase.storage
      .from('point-photos')
      .upload(
        uploadedPath,
        file,
        {
          cacheControl: '3600',
          upsert: false,
          contentType:
            file.type || 'image/jpeg'
        }
      )

    if (uploadError) {
      throw uploadError
    }

    const {
      error: insertError
    } = await $supabase
      .from('point_photos')
      .insert({
        point_key: pointKey.value,
        user_id: props.user.id,
        storage_path: uploadedPath
      })

    if (insertError) {
      try {
        await $supabase.storage
          .from('point-photos')
          .remove([uploadedPath])
      } catch {
        // Не блокируем основной сценарий.
      }

      throw insertError
    }

    successMessage.value =
      'Фото опубликовано. +50 баллов начислено.'

    await loadCommunity(true)
    emit('profile-changed')
  } catch (error) {
    console.error(
      '[Community] Ошибка фото:',
      error
    )

    const message = String(
      error?.message || ''
    )

    errorMessage.value =
      message.includes('duplicate') ||
      message.includes('unique')
        ? 'Вы уже получали награду за фото с этой точки.'
        : message ||
          'Не удалось загрузить фотографию.'
  } finally {
    photoUploading.value = false
  }
}

async function saveReview() {
  if (!$supabase) return
  if (!requireAuth()) return
  if (!pointEnabled.value) return

  clearMessages()

  const text = reviewText.value.trim()

  if (text.length < 10) {
    errorMessage.value =
      'Напишите хотя бы 10 символов об этом месте.'
    return
  }

  if (text.length > 1500) {
    errorMessage.value =
      'Отзыв должен быть не длиннее 1500 символов.'
    return
  }

  reviewSaving.value = true

  try {
    const payload = {
      rating: reviewRating.value,
      review_text: text
    }

    if (myReview.value) {
      const {
        error
      } = await $supabase
        .from('point_reviews')
        .update(payload)
        .eq('id', myReview.value.id)

      if (error) throw error

      successMessage.value =
        'Отзыв обновлён.'
    } else {
      const {
        error
      } = await $supabase
        .from('point_reviews')
        .insert({
          ...payload,
          point_key: pointKey.value,
          user_id: props.user.id
        })

      if (error) throw error

      successMessage.value =
        'Отзыв опубликован. +15 баллов начислено.'
    }

    await loadCommunity(true)
    emit('profile-changed')
  } catch (error) {
    console.error(
      '[Community] Ошибка отзыва:',
      error
    )

    errorMessage.value =
      error?.message ||
      'Не удалось сохранить отзыв.'
  } finally {
    reviewSaving.value = false
  }
}

watch(
  () => [
    pointKey.value,
    currentUserId.value,
    props.isAuthenticated
  ],
  () => {
    loadCommunity()
  }
)

onMounted(() => {
  loadCommunity()
})
</script>

<template>
  <section class="point-community">
    <div class="community-divider"></div>

    <div class="community-heading">
      <div>
        <span class="community-kicker">
          Сообщество путешественников
        </span>
        <h3>Впечатления об этом месте</h3>
      </div>

      <div
        v-if="reviews.length"
        class="community-rating-summary"
      >
        <strong>{{ averageRating }}</strong>
        <span
          class="rating-stars"
          :aria-label="`Рейтинг ${averageRating} из 5`"
        >
          {{ starString(averageStars) }}
        </span>
        <small>
          {{ reviews.length }}
          {{
            reviews.length === 1
              ? 'отзыв'
              : 'отзывов'
          }}
        </small>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="community-alert error"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="successMessage"
      class="community-alert success"
    >
      {{ successMessage }}
    </div>

    <div
      v-if="loading"
      class="community-loading"
    >
      Загружаем фотографии и отзывы…
    </div>

    <template v-else-if="pointEnabled">
      <section class="community-section">
        <div class="community-section-head">
          <div>
            <span>📸 Фотографии</span>
            <h4>Снимки путешественников</h4>
          </div>

          <span class="community-reward">
            +50 баллов
          </span>
        </div>

        <div
          v-if="photos.length"
          class="community-photo-grid"
        >
          <a
            v-for="photo in photos"
            :key="photo.id"
            :href="photo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="community-photo"
          >
            <img
              :src="photo.url"
              :alt="`Фото: ${stop.name}`"
              loading="lazy"
            >

            <span class="community-photo-author">
              {{ photo.display_name || 'Путешественник' }}
            </span>
          </a>
        </div>

        <div
          v-else
          class="community-empty"
        >
          Пока никто не загрузил фотографию.
          Будьте первым.
        </div>

        <input
          ref="fileInput"
          class="community-file-input"
          type="file"
          accept="image/*"
          @change="uploadPhoto"
        >

        <button
          type="button"
          class="community-action-btn photo"
          :disabled="photoUploading || Boolean(myPhoto)"
          @click="choosePhoto"
        >
          <template v-if="!isAuthenticated">
            Войти и загрузить фото · +50
          </template>
          <template v-else-if="myPhoto">
            ✓ Фото загружено · награда получена
          </template>
          <template v-else-if="photoUploading">
            Загружаем фото…
          </template>
          <template v-else>
            Загрузить своё фото · +50 баллов
          </template>
        </button>

        <p class="community-hint">
          Награда за фотографию с каждой точки
          начисляется один раз.
        </p>
      </section>

      <section class="community-section reviews">
        <div class="community-section-head">
          <div>
            <span>⭐ Отзывы</span>
            <h4>Оцените место</h4>
          </div>

          <span class="community-reward">
            +15 баллов
          </span>
        </div>

        <div class="review-editor">
          <div class="review-stars-input">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              :class="{
                active: star <= reviewRating
              }"
              :aria-label="`${star} из 5`"
              @click="reviewRating = star"
            >
              ★
            </button>

            <strong>
              {{ reviewRating }}/5
            </strong>
          </div>

          <textarea
            v-model="reviewText"
            :disabled="!isAuthenticated"
            maxlength="1500"
            rows="4"
            :placeholder="
              isAuthenticated
                ? 'Что понравилось? Что стоит знать другим путешественникам?'
                : 'Войдите, чтобы оставить отзыв'
            "
          ></textarea>

          <div class="review-editor-footer">
            <span>
              {{ reviewText.length }}/1500
            </span>

            <button
              type="button"
              class="community-action-btn review"
              :disabled="reviewSaving"
              @click="
                isAuthenticated
                  ? saveReview()
                  : $emit('request-auth')
              "
            >
              <template v-if="!isAuthenticated">
                Войти и оставить отзыв
              </template>
              <template v-else-if="reviewSaving">
                Сохраняем…
              </template>
              <template v-else-if="myReview">
                Обновить отзыв
              </template>
              <template v-else>
                Опубликовать · +15 баллов
              </template>
            </button>
          </div>

          <p
            v-if="myReview"
            class="community-hint"
          >
            Отзыв можно менять в любое время.
            Баллы начисляются только за первую публикацию.
          </p>
        </div>

        <div
          v-if="reviews.length"
          class="community-review-list"
        >
          <article
            v-for="review in reviews"
            :key="review.id"
            class="community-review-card"
          >
            <div class="review-author">
              <img
                v-if="review.avatar_url"
                :src="review.avatar_url"
                :alt="review.display_name || 'Пользователь'"
              >

              <span
                v-else
                class="review-author-placeholder"
              >
                {{ initials(review.display_name) }}
              </span>

              <div>
                <strong>
                  {{ review.display_name || 'Путешественник' }}
                </strong>
                <span>
                  {{ formatDate(review.created_at) }}
                </span>
              </div>
            </div>

            <div
              class="review-stars-display"
              :aria-label="`${review.rating} из 5`"
            >
              {{ starString(review.rating) }}
            </div>

            <p>{{ review.review_text }}</p>
          </article>
        </div>

        <div
          v-else
          class="community-empty"
        >
          Отзывов пока нет. Расскажите другим,
          каким вам показалось это место.
        </div>
      </section>
    </template>

    <div
      v-else
      class="community-unavailable"
    >
      Фото, отзывы и баллы пока доступны
      для проверенных точек готовых маршрутов.
    </div>
  </section>
</template>
