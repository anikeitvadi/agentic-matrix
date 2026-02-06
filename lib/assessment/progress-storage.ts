/**
 * SSR-safe localStorage utilities for assessment progress persistence
 */

const STORAGE_KEY_PREFIX = 'assessment-progress'
const STEP_KEY = `${STORAGE_KEY_PREFIX}-step`

/**
 * Get the form data storage key for react-hook-form-persist
 */
export function getFormStorageKey(): string {
  return `${STORAGE_KEY_PREFIX}-form`
}

/**
 * Check if code is running in browser (not SSR)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Save current step to localStorage
 */
export function saveCurrentStep(step: number): void {
  if (!isBrowser()) return

  try {
    localStorage.setItem(STEP_KEY, step.toString())
  } catch (error) {
    console.error('Failed to save current step:', error)
  }
}

/**
 * Load current step from localStorage
 * Returns 1 (first step) if no saved step exists
 */
export function loadCurrentStep(): number {
  if (!isBrowser()) return 1

  try {
    const saved = localStorage.getItem(STEP_KEY)
    if (saved) {
      const step = parseInt(saved, 10)
      return isNaN(step) ? 1 : step
    }
  } catch (error) {
    console.error('Failed to load current step:', error)
  }

  return 1
}

/**
 * Clear all saved progress (form data and step)
 */
export function clearProgress(): void {
  if (!isBrowser()) return

  try {
    localStorage.removeItem(STEP_KEY)
    localStorage.removeItem(getFormStorageKey())
  } catch (error) {
    console.error('Failed to clear progress:', error)
  }
}

/**
 * Check if there is any saved progress
 */
export function hasSavedProgress(): boolean {
  if (!isBrowser()) return false

  try {
    const hasStep = localStorage.getItem(STEP_KEY) !== null
    const hasFormData = localStorage.getItem(getFormStorageKey()) !== null
    return hasStep || hasFormData
  } catch (error) {
    console.error('Failed to check for saved progress:', error)
    return false
  }
}
