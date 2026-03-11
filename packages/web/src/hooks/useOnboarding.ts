import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.js'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export interface UseOnboardingReturn {
  /** Whether the banner should be shown */
  showBanner: boolean
  /** Whether the user has dismissed the banner */
  isDismissed: boolean
  /** Dismiss the banner for 7 days */
  dismiss: () => void
  /** Has API key set */
  hasApiKey: boolean
  /** Check if we should expand EngineSettings */
  shouldExpandSettings: boolean
  /** Mark settings as expanded (resets the flag) */
  markSettingsExpanded: () => void
}

export function useOnboarding(hasApiKey: boolean): UseOnboardingReturn {
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>(
    'spectator-banner-dismissed',
    null
  )
  const [shouldExpandSettings, setShouldExpandSettings] = useLocalStorage(
    'spectator-settings-should-expand',
    false
  )

  const [isDismissed, setIsDismissed] = useState(false)

  // Check if dismissed within 7 days
  useEffect(() => {
    if (dismissedAt) {
      const age = Date.now() - dismissedAt
      setIsDismissed(age < SEVEN_DAYS_MS)
    } else {
      setIsDismissed(false)
    }
  }, [dismissedAt])

  const showBanner = !hasApiKey && !isDismissed

  const dismiss = () => {
    setDismissedAt(Date.now())
    setIsDismissed(true)
  }

  const markSettingsExpanded = () => {
    setShouldExpandSettings(false)
  }

  return {
    showBanner,
    isDismissed,
    dismiss,
    hasApiKey,
    shouldExpandSettings,
    markSettingsExpanded,
  }
}
