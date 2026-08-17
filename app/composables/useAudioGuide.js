import {
  ref,
  onMounted,
  onBeforeUnmount
} from 'vue'

export function useAudioGuide() {
  const availableVoices = ref([])
  const isSpeaking = ref(false)
  const currentStopId = ref(null)

  let audioPauseTimer = null

  function loadSpeechVoices() {
    if (
      typeof window === 'undefined' ||
      !window.speechSynthesis
    ) {
      return
    }

    availableVoices.value =
      window.speechSynthesis.getVoices()

    window.speechSynthesis.onvoiceschanged = () => {
      availableVoices.value =
        window.speechSynthesis.getVoices()
    }
  }

  function getBestRussianVoice() {
    const voices = availableVoices.value || []

    return (
      voices.find((voice) =>
        voice.lang === 'ru-RU' &&
        voice.name.toLowerCase().includes('milena')
      ) ||
      voices.find((voice) =>
        voice.lang === 'ru-RU' &&
        voice.name.toLowerCase().includes('google')
      ) ||
      voices.find((voice) =>
        voice.lang === 'ru-RU' &&
        voice.name.toLowerCase().includes('microsoft')
      ) ||
      voices.find((voice) =>
        voice.lang === 'ru-RU'
      ) ||
      voices.find((voice) =>
        voice.lang?.toLowerCase().startsWith('ru')
      ) ||
      null
    )
  }

  function clearAudioPauseTimer() {
    if (!audioPauseTimer) return

    clearTimeout(audioPauseTimer)
    audioPauseTimer = null
  }

  function stopAudioGuide() {
    clearAudioPauseTimer()

    if (
      typeof window !== 'undefined' &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel()
    }

    isSpeaking.value = false
    currentStopId.value = null
  }

  function playStopAudio(stop) {
    if (
      !stop ||
      typeof window === 'undefined' ||
      !window.speechSynthesis
    ) {
      return
    }

    stopAudioGuide()

    const text =
      stop.audio ||
      `${stop.name}. ${stop.description}`

    const voice = getBestRussianVoice()

    const parts = text
      .replaceAll('—', '. ')
      .split(/(?<=[.!?])\s+/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (!parts.length) return

    let index = 0

    isSpeaking.value = true
    currentStopId.value = stop.id || null

    function speakNextPart() {
      if (index >= parts.length) {
        isSpeaking.value = false
        currentStopId.value = null
        return
      }

      const speech =
        new SpeechSynthesisUtterance(parts[index])

      speech.lang = 'ru-RU'
      speech.rate = 0.82
      speech.pitch = 1.05
      speech.volume = 1

      if (voice) {
        speech.voice = voice
      }

      speech.onend = () => {
        index += 1

        audioPauseTimer = setTimeout(() => {
          speakNextPart()
        }, 350)
      }

      speech.onerror = () => {
        isSpeaking.value = false
        currentStopId.value = null
        clearAudioPauseTimer()
      }

      window.speechSynthesis.speak(speech)
    }

    speakNextPart()
  }

  onMounted(() => {
    loadSpeechVoices()
  })

  onBeforeUnmount(() => {
    stopAudioGuide()

    if (
      typeof window !== 'undefined' &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.onvoiceschanged = null
    }
  })

  return {
    availableVoices,
    isSpeaking,
    currentStopId,
    playStopAudio,
    stopAudioGuide,
    loadSpeechVoices,
    getBestRussianVoice
  }
}
