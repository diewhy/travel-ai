import {
  ref,
  computed
} from 'vue'

export function useUserProfile() {
  const showProfilePanel = ref(false)

  const userProfile = ref({
    name: 'Александр',
    initials: 'АК',
    role: 'Участник проекта',
    level: 3,
    points: 420,
    nextLevelPoints: 600,
    routesCompleted: 2,
    tasksCompleted: 7,
    photosUploaded: 4,
    reviewsLeft: 3
  })

  const profileProgressPercent = computed(() => {
    const nextLevelPoints =
      Number(userProfile.value.nextLevelPoints) || 0

    if (nextLevelPoints <= 0) return 0

    return Math.min(
      100,
      Math.round(
        (
          Number(userProfile.value.points || 0) /
          nextLevelPoints
        ) * 100
      )
    )
  })

  function openProfilePanel() {
    showProfilePanel.value = true
  }

  function closeProfilePanel() {
    showProfilePanel.value = false
  }

  function addPoints(amount) {
    const points = Number(amount) || 0

    if (points <= 0) return

    userProfile.value.points += points
  }

  function updateProfile(patch = {}) {
    userProfile.value = {
      ...userProfile.value,
      ...patch
    }
  }

  return {
    userProfile,
    showProfilePanel,
    profileProgressPercent,
    openProfilePanel,
    closeProfilePanel,
    addPoints,
    updateProfile
  }
}
