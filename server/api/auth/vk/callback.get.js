function firstValue(value) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
}

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const params = new URLSearchParams()

  const code =
    firstValue(query.code)

  const deviceId =
    firstValue(query.device_id)

  const state =
    firstValue(query.state)

  const error =
    firstValue(query.error)

  const errorDescription =
    firstValue(query.error_description)

  if (code) {
    params.set('vk_code', String(code))
  }

  if (deviceId) {
    params.set(
      'vk_device_id',
      String(deviceId)
    )
  }

  if (state) {
    params.set(
      'vk_state',
      String(state)
    )
  }

  if (error) {
    params.set(
      'vk_error',
      String(error)
    )
  }

  if (errorDescription) {
    params.set(
      'vk_error_description',
      String(errorDescription)
    )
  }

  const target =
    params.toString()
      ? `/?${params.toString()}`
      : '/'

  return sendRedirect(
    event,
    target,
    302
  )
})
