import {
  createClient
} from '@supabase/supabase-js'

function normalizeVkUser(payload) {
  const user =
    payload?.user ||
    payload?.response?.user ||
    payload?.response ||
    payload

  const id =
    user?.user_id ||
    user?.id ||
    ''

  const firstName =
    user?.first_name ||
    ''

  const lastName =
    user?.last_name ||
    ''

  const displayName =
    user?.name ||
    [firstName, lastName]
      .filter(Boolean)
      .join(' ') ||
    'Путешественник'

  const avatarUrl =
    user?.avatar ||
    user?.avatar_200 ||
    user?.photo_200 ||
    user?.photo ||
    ''

  const email =
    user?.email ||
    ''

  return {
    id: String(id || ''),
    firstName,
    lastName,
    displayName,
    avatarUrl,
    email
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body =
    await readBody(event)

  const accessToken =
    String(
      body?.accessToken || ''
    ).trim()

  if (!accessToken) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'VK access_token не передан.'
    })
  }

  const vkClientId =
    String(
      config.public.vkClientId || ''
    ).trim()

  if (!vkClientId) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'NUXT_PUBLIC_VK_CLIENT_ID не настроен.'
    })
  }

  const supabaseUrl =
    String(
      config.public.supabaseUrl || ''
    ).trim()

  const supabaseSecretKey =
    String(
      config.supabaseSecretKey || ''
    ).trim()

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Серверный ключ Supabase не настроен.'
    })
  }

  let vkPayload

  try {
    vkPayload = await $fetch(
      'https://id.vk.ru/oauth2/user_info',
      {
        method: 'POST',

        query: {
          client_id: vkClientId
        },

        body: new URLSearchParams({
          access_token: accessToken
        }),

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      }
    )
  } catch (error) {
    console.error(
      '[VK Auth] user_info error:',
      error
    )

    throw createError({
      statusCode: 401,
      statusMessage:
        'VK ID не подтвердил пользователя.'
    })
  }

  const vkUser =
    normalizeVkUser(vkPayload)

  if (!vkUser.id) {
    console.error(
      '[VK Auth] Missing VK user id:',
      vkPayload
    )

    throw createError({
      statusCode: 502,
      statusMessage:
        'VK ID не вернул идентификатор пользователя.'
    })
  }

  if (!vkUser.email) {
    throw createError({
      statusCode: 422,
      statusMessage:
        'VK ID не вернул email. Проверьте, что приложению разрешён доступ к электронной почте.'
    })
  }

  const supabaseAdmin =
    createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

  const metadata = {
    full_name: vkUser.displayName,
    name: vkUser.displayName,
    first_name: vkUser.firstName,
    last_name: vkUser.lastName,
    avatar_url: vkUser.avatarUrl,
    picture: vkUser.avatarUrl,
    auth_provider: 'vk',
    vk_user_id: vkUser.id
  }

  const {
    data: linkData,
    error: linkError
  } =
    await supabaseAdmin.auth.admin
      .generateLink({
        type: 'magiclink',
        email: vkUser.email,
        options: {
          data: metadata
        }
      })

  if (
    linkError ||
    !linkData?.properties?.hashed_token ||
    !linkData?.user?.id
  ) {
    console.error(
      '[VK Auth] Supabase generateLink error:',
      linkError
    )

    throw createError({
      statusCode: 500,
      statusMessage:
        'Не удалось создать Supabase-сессию.'
    })
  }

  // Для уже существующего пользователя generateLink
  // может сохранить старые metadata. Обновляем их
  // проверенными данными из VK ID.
  const currentMetadata =
    linkData.user.user_metadata || {}

  const {
    error: updateError
  } =
    await supabaseAdmin.auth.admin
      .updateUserById(
        linkData.user.id,
        {
          user_metadata: {
            ...currentMetadata,
            ...metadata
          }
        }
      )

  if (updateError) {
    console.warn(
      '[VK Auth] Metadata update warning:',
      updateError.message
    )
  }

  return {
    tokenHash:
      linkData.properties.hashed_token
  }
})
