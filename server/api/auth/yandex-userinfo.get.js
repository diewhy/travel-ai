export default defineEventHandler(async (event) => {
  const authorization =
    getHeader(event, 'authorization') || ''

  const authMatch = authorization.match(
    /^(?:Bearer|OAuth)\s+(.+)$/i
  )

  const query = getQuery(event)

  const accessToken =
    authMatch?.[1] ||
    query.access_token ||
    query.oauth_token ||
    ''

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing OAuth access token'
    })
  }

  let yandexProfile

  try {
    yandexProfile = await $fetch(
      'https://login.yandex.ru/info',
      {
        method: 'GET',
        query: {
          format: 'json'
        },
        headers: {
          Authorization: `OAuth ${accessToken}`,
          Accept: 'application/json'
        }
      }
    )
  } catch (error) {
    console.error(
      '[Yandex UserInfo Adapter] Yandex profile request failed:',
      error
    )

    throw createError({
      statusCode: 502,
      statusMessage:
        'Failed to load profile from Yandex ID'
    })
  }

  const subject = String(
    yandexProfile?.psuid ||
    yandexProfile?.id ||
    ''
  )

  if (!subject) {
    throw createError({
      statusCode: 502,
      statusMessage:
        'Yandex ID did not return a user identifier'
    })
  }

  const email =
    yandexProfile?.default_email ||
    yandexProfile?.emails?.[0] ||
    null

  const name =
    yandexProfile?.real_name ||
    yandexProfile?.display_name ||
    [
      yandexProfile?.first_name,
      yandexProfile?.last_name
    ]
      .filter(Boolean)
      .join(' ') ||
    yandexProfile?.login ||
    'Путешественник'

  const picture = yandexProfile?.default_avatar_id
    ? `https://avatars.yandex.net/get-yapic/${yandexProfile.default_avatar_id}/islands-200`
    : null

  return {
    sub: subject,
    id: subject,

    email,
    email_verified: Boolean(email),

    name,
    display_name:
      yandexProfile?.display_name || name,
    given_name:
      yandexProfile?.first_name || null,
    family_name:
      yandexProfile?.last_name || null,
    preferred_username:
      yandexProfile?.login || null,

    picture,

    provider: 'yandex'
  }
})
