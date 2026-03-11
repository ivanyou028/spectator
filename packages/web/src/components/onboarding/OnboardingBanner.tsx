import { useEffect, useRef } from 'react'
import { Key, X } from 'lucide-react'
import { useOnboarding } from '../../hooks/useOnboarding.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { usePlayground } from '../../stores/playground.js'

interface OnboardingBannerProps {
  hasApiKey: boolean
}

export function OnboardingBanner({ hasApiKey }: OnboardingBannerProps) {
  const { showBanner, dismiss } = useOnboarding(hasApiKey)
  const [, setShouldExpandSettings] = useLocalStorage('spectator-settings-should-expand', false)
  const { state, dispatch } = usePlayground()
  const bannerRef = useRef<HTMLDivElement>(null)

  // Scroll and focus logic - extracted to reuse after view switch
  const performScrollAndFocus = () => {
    // Scroll to the EngineSettings section
    const engineSettingsSection = document.querySelector('[data-engine-settings]')
    const sidebar = document.querySelector('aside')
    
    console.log('[OnboardingBanner] engineSettingsSection:', engineSettingsSection)
    console.log('[OnboardingBanner] sidebar:', sidebar)
    
    if (engineSettingsSection && sidebar) {
      console.log('[OnboardingBanner] Scrolling sidebar to:', engineSettingsSection.offsetTop - 16)
      sidebar.scrollTo({ 
        top: engineSettingsSection.offsetTop - 16, 
        behavior: 'smooth' 
      })
    } else if (engineSettingsSection) {
      console.log('[OnboardingBanner] Fallback: scrollIntoView')
      engineSettingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (sidebar) {
      console.log('[OnboardingBanner] Last resort: scroll to top')
      sidebar.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.log('[OnboardingBanner] ERROR: No sidebar or engine settings found')
    }

    // Focus the API key input after accordion expands
    const tryFocusInput = (attempts = 0) => {
      const apiKeyInput = document.querySelector('[data-api-key-input]') as HTMLInputElement
      console.log(`[OnboardingBanner] Focus attempt ${attempts}, found:`, !!apiKeyInput)
      
      if (apiKeyInput) {
        apiKeyInput.focus()
        apiKeyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        console.log('[OnboardingBanner] Input focused')
      } else if (attempts < 20) {
        setTimeout(() => tryFocusInput(attempts + 1), 50)
      } else {
        console.log('[OnboardingBanner] ERROR: Could not find input')
      }
    }
    
    setTimeout(tryFocusInput, 100)
  }

  // Handle scroll to settings and expand
  const handleAddKey = () => {
    console.log('[OnboardingBanner] handleAddKey clicked!')
    
    // Set the flag to expand EngineSettings
    setShouldExpandSettings(true)
    console.log('[OnboardingBanner] setShouldExpandSettings(true)')

    // If in Graph View, switch to Form View first
    if (state.viewMode === 'graph') {
      console.log('[OnboardingBanner] Switching to form view')
      dispatch({ type: 'SET_VIEW_MODE', payload: 'form' })
      // Wait for Sidebar to mount after view switch
      setTimeout(() => performScrollAndFocus(), 150)
    } else {
      // Already in Form View
      performScrollAndFocus()
    }
  }

  // Handle keyboard shortcut (Escape to dismiss)
  useEffect(() => {
    if (!showBanner) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showBanner, dismiss])

  if (!showBanner) return null

  return (
    <div
      ref={bannerRef}
      role="banner"
      aria-label="API key onboarding"
      className="sticky top-0 z-50 border-b border-amber-500/30 bg-amber-500/15"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Icon and text - grows to fill space */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Key className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          <p className="truncate text-sm font-medium text-amber-200">
            Welcome! Add your API key to start generating stories
          </p>
        </div>

        {/* Actions - don't shrink */}
        <div className="flex shrink-0 items-center gap-2">
          {/* CTA Button */}
          <button
            onClick={handleAddKey}
            className="rounded-md bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
            aria-label="Add API Key - scrolls to Engine Settings"
          >
            Add API Key →
          </button>

          {/* Dismiss button */}
          <button
            onClick={dismiss}
            aria-label="Dismiss API key reminder"
            className="rounded-md p-1.5 text-amber-400/70 transition-colors hover:bg-amber-500/20 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
            title="Dismiss for 7 days (Escape)"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile layout - wraps on very small screens */}
      <style>{`
        @media (max-width: 480px) {
          [role="banner"] > div {
            flex-wrap: wrap;
          }
          [role="banner"] > div > div:first-child {
            width: 100%;
            margin-bottom: 0.5rem;
          }
          [role="banner"] button:first-of-type {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}
