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
  <section class="point-community rp2c" aria-label="Фотографии и отзывы путешественников">
    <header class="rp2c-header">
      <div class="rp2c-header-copy">
        <span class="rp2c-eyebrow">СООБЩЕСТВО RUSSPLORE</span>
        <h3>Впечатления путешественников</h3>
        <p>Делитесь фотографиями и помогайте другим открывать интересные места.</p>
      </div>

      <div v-if="reviews.length" class="rp2c-rating-summary" :aria-label="`Средняя оценка ${averageRating} из 5`">
        <strong>{{ averageRating }}</strong>
        <span class="rp2c-rating-summary-meta">
          <span class="rp2c-rating-stars" aria-hidden="true">{{ starString(averageStars) }}</span>
          <small>{{ reviews.length }} {{ reviews.length === 1 ? 'отзыв' : 'отзывов' }}</small>
        </span>
      </div>
    </header>

    <div v-if="errorMessage" class="rp2c-alert rp2c-alert--error" role="alert">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg>
      <span>{{ errorMessage }}</span>
    </div>
    <div v-if="successMessage" class="rp2c-alert rp2c-alert--success" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="loading" class="rp2c-loading" role="status">
      <span class="rp2c-loader" aria-hidden="true"></span>
      Загружаем фотографии и отзывы…
    </div>

    <template v-else-if="pointEnabled">
      <!-- Photos / reward -->
      <section class="rp2c-card" aria-labelledby="rp2c-photos-title">
        <div class="rp2c-card-head">
          <div class="rp2c-card-title-group">
            <span class="rp2c-section-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 7h4l2-3h4l2 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg>
            </span>
            <div>
              <span class="rp2c-section-kicker">ФОТОГРАФИИ</span>
              <h4 id="rp2c-photos-title">Место вашими глазами</h4>
            </div>
          </div>
          <span class="rp2c-reward">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v10m-3-7h5a2 2 0 0 1 0 4H9"/></svg>
            +50 баллов
          </span>
        </div>

        <div v-if="photos.length" class="rp2c-photo-grid">
          <a
            v-for="photo in photos"
            :key="photo.id"
            :href="photo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="rp2c-photo"
          >
            <img :src="photo.url" :alt="`Фото: ${stop.name}`" loading="lazy">
            <span class="rp2c-photo-author">{{ photo.display_name || 'Путешественник' }}</span>
          </a>
        </div>

        <div class="rp2c-upload" :class="{ 'rp2c-upload--done': Boolean(myPhoto) }">
          <span class="rp2c-upload-icon" aria-hidden="true">
            <svg v-if="myPhoto" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/></svg>
            <svg v-else viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6l1.5-3h5L16 6"/><circle cx="12" cy="13.5" r="3.2"/></svg>
          </span>
          <div class="rp2c-upload-copy">
            <strong>{{ myPhoto ? 'Ваш снимок опубликован' : 'Добавьте свой снимок' }}</strong>
            <p>{{ myPhoto ? 'Спасибо, что делитесь впечатлениями с сообществом.' : photos.length ? 'Покажите это место со своего ракурса.' : 'Станьте первым, кто покажет это место другим путешественникам.' }}</p>
            <small>{{ myPhoto ? 'Награда за эту точку уже получена' : 'Фотография до 10 МБ · награда один раз за точку' }}</small>
          </div>
          <button
            type="button"
            class="rp2c-button rp2c-button--photo"
            :disabled="photoUploading || Boolean(myPhoto)"
            @click="choosePhoto"
          >
            <svg v-if="!myPhoto" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
            <span v-if="!isAuthenticated">Войти и добавить</span>
            <span v-else-if="myPhoto">Фото добавлено</span>
            <span v-else-if="photoUploading">Загружаем…</span>
            <span v-else>Загрузить фото</span>
          </button>
          <input
            ref="fileInput"
            class="rp2c-file-input"
            type="file"
            accept="image/*"
            aria-label="Выберите фотографию достопримечательности"
            tabindex="-1"
            @change="uploadPhoto"
          >
        </div>
      </section>

      <!-- Reviews -->
      <section class="rp2c-card" aria-labelledby="rp2c-reviews-title">
        <div class="rp2c-card-head">
          <div class="rp2c-card-title-group">
            <span class="rp2c-section-icon rp2c-section-icon--star" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 7 1-5.1 5 1.2 7L12 18l-6.2 3.3 1.2-7-5.1-5 7-1z"/></svg>
            </span>
            <div>
              <span class="rp2c-section-kicker">ОТЗЫВЫ</span>
              <h4 id="rp2c-reviews-title">Оцените это место</h4>
            </div>
          </div>
          <span class="rp2c-reward">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v10m-3-7h5a2 2 0 0 1 0 4H9"/></svg>
            +15 баллов
          </span>
        </div>

        <div class="rp2c-editor">
          <div class="rp2c-field-label">Ваша оценка</div>
          <div class="rp2c-rating-row" role="group" aria-label="Оценка места от 1 до 5 звёзд">
            <div class="rp2c-stars-input">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="rp2c-star-button"
                :class="{ 'is-active': star <= reviewRating }"
                :aria-label="`${star} из 5`"
                :aria-pressed="reviewRating === star"
                @click="reviewRating = star"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 7 1-5.1 5 1.2 7L12 18l-6.2 3.3 1.2-7-5.1-5 7-1z"/></svg>
              </button>
            </div>
            <span class="rp2c-rating-value">{{ reviewRating }} из 5</span>
          </div>

          <label for="rp2c-review-text" class="rp2c-field-label rp2c-field-label--review">Ваш отзыв</label>
          <textarea
            id="rp2c-review-text"
            v-model="reviewText"
            :disabled="!isAuthenticated"
            maxlength="1500"
            rows="4"
            :placeholder="isAuthenticated ? 'Что понравилось? Что стоит знать другим путешественникам?' : 'Войдите, чтобы оставить отзыв'"
          ></textarea>
          <div class="rp2c-editor-footer">
            <span class="rp2c-counter">{{ reviewText.length }} / 1500 символов</span>
            <button
              type="button"
              class="rp2c-button rp2c-button--review"
              :disabled="reviewSaving"
              @click="isAuthenticated ? saveReview() : $emit('request-auth')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
              <span v-if="!isAuthenticated">Войти и оценить</span>
              <span v-else-if="reviewSaving">Сохраняем…</span>
              <span v-else-if="myReview">Обновить отзыв</span>
              <span v-else>Опубликовать отзыв</span>
            </button>
          </div>
          <p class="rp2c-note">
            {{ myReview ? 'Отзыв можно отредактировать в любое время. Баллы начисляются только за первую публикацию.' : 'Напишите не менее 10 символов. За первый опубликованный отзыв начисляются баллы.' }}
          </p>
        </div>

        <div v-if="reviews.length" class="rp2c-reviews">
          <div class="rp2c-list-heading">
            <strong>Что говорят путешественники</strong>
            <span>{{ reviews.length }} {{ reviews.length === 1 ? 'отзыв' : 'отзывов' }}</span>
          </div>
          <article v-for="review in reviews" :key="review.id" class="rp2c-review-card">
            <div class="rp2c-review-top">
              <div class="rp2c-author">
                <img v-if="review.avatar_url" :src="review.avatar_url" :alt="review.display_name || 'Пользователь'">
                <span v-else class="rp2c-author-placeholder">{{ initials(review.display_name) }}</span>
                <span class="rp2c-author-info">
                  <strong>{{ review.display_name || 'Путешественник' }}</strong>
                  <small>{{ formatDate(review.created_at) }}</small>
                </span>
              </div>
              <span class="rp2c-review-stars" :aria-label="`Оценка ${review.rating} из 5`">{{ starString(review.rating) }}</span>
            </div>
            <p>{{ review.review_text }}</p>
          </article>
        </div>
        <div v-else class="rp2c-reviews-empty">Пока нет отзывов. Поделитесь впечатлением первым.</div>
      </section>
    </template>

    <div v-else class="rp2c-unavailable">
      Фото, отзывы и баллы пока доступны для проверенных точек готовых маршрутов.
    </div>
  </section>
</template>

<style scoped>
/* Russplore 2.0 — PointCommunity. Only UI is changed; Supabase logic remains unchanged. */
.rp2c {
  --rp2c-ink: #193347;
  --rp2c-muted: #718694;
  --rp2c-green: #078b7c;
  --rp2c-line: #e2eaed;
  margin: 0;
  min-width: 0;
  color: var(--rp2c-ink);
  font-family: Manrope, Arial, sans-serif;
}
.rp2c *, .rp2c *::before, .rp2c *::after { box-sizing: border-box; }
.rp2c-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-bottom: 22px; }
.rp2c-header-copy { min-width: 0; flex: 1 1 310px; }
.rp2c-eyebrow { display: block; color: var(--rp2c-green); font-size: 10px; font-weight: 800; letter-spacing: .11em; }
.rp2c-header h3 { margin: 7px 0 6px; color: var(--rp2c-ink); font-size: clamp(19px, 2.6vw, 24px); font-weight: 800; line-height: 1.25; letter-spacing: -.025em; }
.rp2c-header p { max-width: 570px; margin: 0; color: var(--rp2c-muted); font-size: 12px; line-height: 1.65; }
.rp2c-rating-summary { display: inline-flex; align-items: center; gap: 11px; padding: 11px 15px; border: 1px solid #dfede8; border-radius: 13px; background: #f2faf7; }
.rp2c-rating-summary > strong { color: #1a574e; font-size: 28px; line-height: 1; letter-spacing: -.04em; }
.rp2c-rating-summary-meta { display: flex; flex-direction: column; gap: 2px; }
.rp2c-rating-stars, .rp2c-review-stars { color: #efa81c; font-family: Arial, sans-serif; letter-spacing: .08em; white-space: nowrap; }
.rp2c-rating-summary-meta small { color: var(--rp2c-muted); font-size: 10px; }
.rp2c-card { min-width: 0; margin: 0 0 15px; padding: clamp(16px, 2.5vw, 23px); border: 1px solid var(--rp2c-line); border-radius: 16px; background: #fff; }
.rp2c-card:last-child { margin-bottom: 0; }
.rp2c-card-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.rp2c-card-title-group { display: flex; align-items: center; min-width: 0; gap: 12px; }
.rp2c-section-icon { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 44px; border-radius: 13px; background: #e8f6f2; color: var(--rp2c-green); }
.rp2c-section-icon--star { background: #fff6e7; color: #ca8c15; }
.rp2c-section-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.rp2c-section-kicker { display: block; color: var(--rp2c-green); font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.rp2c-card-head h4 { margin: 4px 0 0; color: var(--rp2c-ink); font-size: 16px; font-weight: 800; line-height: 1.25; }
.rp2c-reward { display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0; min-height: 28px; padding: 5px 10px; border-radius: 999px; background: #e9f6f0; color: #187761; font-size: 11px; font-weight: 800; }
.rp2c-reward svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.rp2c-photo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 15px; }
.rp2c-photo { position: relative; display: block; min-width: 0; aspect-ratio: 1.45; overflow: hidden; border-radius: 12px; background: #e9f0f1; }
.rp2c-photo img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .2s ease; }
.rp2c-photo:hover img { transform: scale(1.035); }
.rp2c-photo-author { position: absolute; right: 0; bottom: 0; left: 0; padding: 20px 9px 8px; background: linear-gradient(transparent, rgba(7,25,35,.72)); color: #fff; font-size: 10px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp2c-upload { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 14px; padding: 18px; border: 1px dashed #a8d0c7; border-radius: 14px; background: #f5fbf9; }
.rp2c-upload--done { border-style: solid; border-color: #c8e6dc; background: #f1faf6; }
.rp2c-upload-icon { display: grid; place-items: center; flex: 0 0 48px; width: 48px; height: 48px; border-radius: 14px; background: #e1f3ed; color: #078b7c; }
.rp2c-upload-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
.rp2c-upload-copy { flex: 1 1 190px; min-width: 0; }
.rp2c-upload-copy strong { display: block; color: #1c4550; font-size: 13px; font-weight: 800; }
.rp2c-upload-copy p { margin: 4px 0; color: #5c7882; font-size: 11px; line-height: 1.5; }
.rp2c-upload-copy small { display: block; color: #81939b; font-size: 10px; line-height: 1.45; }
.rp2c-file-input { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: 0 !important; border: 0 !important; opacity: 0; overflow: hidden; clip-path: inset(50%); pointer-events: none; }
.rp2c-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex: 0 0 auto; width: auto; min-height: 42px; max-width: 100%; margin: 0; padding: 10px 14px; border: 1px solid #078b7c; border-radius: 10px; background: #078b7c; color: #fff; font-size: 11px; font-weight: 800; line-height: 1.3; text-align: center; cursor: pointer; transition: background .15s ease, transform .15s ease; }
.rp2c-button:not(:disabled):hover { background: #056f65; }
.rp2c-button:not(:disabled):active { transform: translateY(1px); }
.rp2c-button:disabled { opacity: .7; cursor: default; }
.rp2c-button svg { width: 16px; height: 16px; flex: 0 0 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.rp2c-upload--done .rp2c-button { border-color: #cde9df; background: #e0f3e9; color: #15745b; opacity: 1; }
.rp2c-editor { padding: 17px; border: 1px solid #e3ebef; border-radius: 13px; background: #fbfdfd; }
.rp2c-field-label { display: block; margin-bottom: 9px; color: #324f5f; font-size: 12px; font-weight: 800; }
.rp2c-field-label--review { margin: 17px 0 9px; }
.rp2c-rating-row { display: flex; align-items: center; flex-wrap: wrap; gap: 13px; }
.rp2c-stars-input { display: flex; flex-wrap: nowrap; align-items: center; gap: 4px; }
.rp2c-star-button { display: grid; place-items: center; flex: 0 0 38px; width: 38px; height: 38px; padding: 6px; margin: 0; border: 1px solid transparent; border-radius: 9px; background: transparent; color: #afbbc2; cursor: pointer; transition: color .15s ease, background .15s ease; }
.rp2c-star-button svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linejoin: round; }
.rp2c-star-button.is-active { color: #e6a522; }
.rp2c-star-button.is-active svg { fill: currentColor; }
.rp2c-star-button:hover { background: #fff4dc; color: #cd8e16; }
.rp2c-rating-value { padding: 5px 10px; border: 1px solid #f3e4bd; border-radius: 8px; background: #fffaed; color: #9b6d16; font-size: 11px; font-weight: 800; }
.rp2c-editor textarea { display: block; width: 100%; min-height: 120px; margin: 0; padding: 13px 15px; border: 1px solid #dce6eb; border-radius: 11px; background: #fff; color: #193347; font-size: 12px; line-height: 1.65; resize: vertical; box-shadow: none; }
.rp2c-editor textarea::placeholder { color: #91a0a9; }
.rp2c-editor textarea:focus { border-color: #49b9a9; outline: 3px solid rgba(37, 174, 152, .12); }
.rp2c-editor textarea:disabled { background: #f6f8f8; }
.rp2c-editor-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
.rp2c-counter { font-size: 10px; color: #80929e; }
.rp2c-note { margin: 11px 0 0; color: #8395a0; font-size: 10px; line-height: 1.55; }
.rp2c-list-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin: 24px 0 12px; padding-top: 18px; border-top: 1px solid #e9eff1; }
.rp2c-list-heading strong { color: #253f4d; font-size: 13px; }
.rp2c-list-heading span { color: #8395a0; font-size: 11px; }
.rp2c-reviews { display: grid; gap: 10px; }
.rp2c-review-card { padding: 16px; border: 1px solid #e4edef; border-radius: 12px; background: #fff; }
.rp2c-review-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 11px; }
.rp2c-author { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rp2c-author img, .rp2c-author-placeholder { width: 37px; height: 37px; flex: 0 0 37px; border-radius: 50%; object-fit: cover; }
.rp2c-author-placeholder { display: grid; place-items: center; background: #e0f2ed; color: #187d71; font-size: 12px; font-weight: 800; }
.rp2c-author-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rp2c-author-info strong { color: #253f4d; font-size: 12px; overflow-wrap: anywhere; }
.rp2c-author-info small { color: #8797a0; font-size: 10px; }
.rp2c-review-stars { display: inline-block; padding: 5px 8px; border-radius: 7px; background: #fff9ec; font-size: 14px; }
.rp2c-review-card p { margin: 11px 0 0; color: #526c7b; font-size: 12px; line-height: 1.7; white-space: pre-line; overflow-wrap: anywhere; }
.rp2c-reviews-empty { margin-top: 15px; padding: 17px; border-radius: 12px; background: #f7fafb; color: #758a97; font-size: 12px; text-align: center; }
.rp2c-alert { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 14px; padding: 12px 14px; border: 1px solid transparent; border-radius: 11px; font-size: 12px; line-height: 1.55; }
.rp2c-alert svg { width: 19px; height: 19px; flex: 0 0 19px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.rp2c-alert--error { border-color: #f1d5d5; background: #fff4f3; color: #9d4141; }
.rp2c-alert--success { border-color: #cce8dc; background: #edf9f3; color: #166d55; }
.rp2c-loading { display: flex; align-items: center; gap: 12px; padding: 18px; color: var(--rp2c-muted); font-size: 12px; }
.rp2c-loader { width: 19px; height: 19px; border: 2px solid #c6eae2; border-top-color: #078b7c; border-radius: 50%; animation: rp2c-spin .8s linear infinite; }
.rp2c-unavailable { padding: 16px; border: 1px solid #e3eaf0; border-radius: 12px; color: var(--rp2c-muted); font-size: 12px; }
@keyframes rp2c-spin { to { transform: rotate(360deg); } }
@media (max-width: 680px) {
  .rp2c-header { align-items: flex-start; }
  .rp2c-card { padding: 15px; }
  .rp2c-photo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rp2c-upload { padding: 14px; }
  .rp2c-upload .rp2c-button { width: 100%; flex-basis: 100%; }
}
@media (max-width: 420px) {
  .rp2c-photo-grid { grid-template-columns: 1fr; }
  .rp2c-stars-input { gap: 1px; }
  .rp2c-star-button { width: 34px; flex-basis: 34px; height: 35px; }
  .rp2c-star-button svg { width: 23px; height: 23px; }
  .rp2c-editor { padding: 13px; }
  .rp2c-editor-footer .rp2c-button { flex: 1 1 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .rp2c-loader { animation: none; }
  .rp2c-photo img, .rp2c-button, .rp2c-star-button { transition: none; }
}
</style>

