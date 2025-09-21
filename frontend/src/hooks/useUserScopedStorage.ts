// Simple helpers for per-user localStorage with event broadcast

export const getCurrentUserId = (): string => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return 'demo'
    const u = JSON.parse(raw)
    return u?.id || 'demo'
  } catch {
    return 'demo'
  }
}

export const makeUserKey = (base: string): string => {
  const userId = getCurrentUserId()
  return `${base}-${userId}`
}

export const readUserState = <T>(base: string, fallback: T): T => {
  try {
    const key = makeUserKey(base)
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const writeUserState = <T>(base: string, value: T): void => {
  try {
    const userId = getCurrentUserId()
    const key = `${base}-${userId}`
    localStorage.setItem(key, JSON.stringify(value))
    // Broadcast app-wide state update
    const evt = new CustomEvent('df-state', { detail: { key, value, userId } })
    window.dispatchEvent(evt)
  } catch {
    // no-op
  }
}

export const subscribeToUserState = (handler: (detail: { key: string; value: any; userId: string }) => void) => {
  const onEvent = (e: Event) => {
    const ce = e as CustomEvent
    if (ce?.detail) handler(ce.detail)
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.newValue) {
      try {
        handler({ key: e.key, value: JSON.parse(e.newValue), userId: getCurrentUserId() })
      } catch {
        // ignore
      }
    }
  }
  window.addEventListener('df-state', onEvent as EventListener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('df-state', onEvent as EventListener)
    window.removeEventListener('storage', onStorage)
  }
}


