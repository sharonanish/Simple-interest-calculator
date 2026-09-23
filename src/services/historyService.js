function getHistoryStorageKey() {
  return 'simpleInterest_history'
}

function safeParse(value) {
  if (!value) return []

  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

export function getHistory() {
  const saved = safeParse(localStorage.getItem(getHistoryStorageKey()))
  if (saved && Array.isArray(saved)) {
    return saved
  }

  localStorage.setItem(getHistoryStorageKey(), JSON.stringify([]))
  return []
}

export function addHistoryEntry(entry) {
  const history = getHistory()
  const nextEntry = {
    ...entry,
    id: entry.id || `history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: entry.date || new Date().toISOString(),
  }

  const nextHistory = [nextEntry, ...history]
  localStorage.setItem(getHistoryStorageKey(), JSON.stringify(nextHistory))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('history-changed'))
  }
  return nextHistory
}

export function deleteHistoryEntry(id) {
  const nextHistory = getHistory().filter((item) => item.id !== id)
  localStorage.setItem(getHistoryStorageKey(), JSON.stringify(nextHistory))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('history-changed'))
  }
  return nextHistory
}

export function clearHistory() {
  localStorage.setItem(getHistoryStorageKey(), JSON.stringify([]))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('history-changed'))
  }
  return []
}

export function getLastCalculation() {
  const saved = safeParse(localStorage.getItem('simpleInterest_lastCalculation'))
  return saved || null
}

export function isValidCalculationRecord(entry) {
  if (!entry || typeof entry !== 'object') {
    return false
  }

  const principal = Number(entry.principal)
  const rate = Number(entry.rate)
  const time = Number(entry.time)

  if (!Number.isFinite(principal) || principal <= 0) {
    return false
  }

  if (!Number.isFinite(rate) || rate < 0) {
    return false
  }

  if (!Number.isFinite(time) || time <= 0) {
    return false
  }

  return true
}

export function setLastCalculation(entry) {
  if (!entry) {
    localStorage.removeItem('simpleInterest_lastCalculation')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('history-changed'))
    }
    return null
  }

  localStorage.setItem('simpleInterest_lastCalculation', JSON.stringify(entry))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('history-changed'))
  }
  return entry
}

export function formatDateLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getModeLabel(mode) {
  const labels = {
    'calculate-interest': 'Calculate Interest',
    'find-principal': 'Find Principal',
    'find-rate': 'Find Interest Rate',
    'find-time': 'Find Time',
  }

  return labels[mode] || 'Calculate Interest'
}
