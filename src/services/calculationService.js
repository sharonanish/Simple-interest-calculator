function safeParse(value) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function getCurrentCalculation() {
  const value = safeParse(localStorage.getItem('simpleInterest_currentCalculation'))
  return value && typeof value === 'object' ? value : null
}

export function isCalculationDataValid(value) {
  if (!value || typeof value !== 'object') {
    return false
  }

  const principal = Number(value.principal)
  const rate = Number(value.rate)
  const time = Number(value.time)

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

export function setCurrentCalculation(entry) {
  if (!isCalculationDataValid(entry)) {
    localStorage.removeItem('simpleInterest_currentCalculation')
    return null
  }

  const next = {
    ...entry,
    principal: Number(entry.principal),
    rate: Number(entry.rate),
    time: Number(entry.time),
    unit: entry.unit === 'months' ? 'months' : 'years',
    mode: entry.mode || 'calculate-interest',
  }

  localStorage.setItem('simpleInterest_currentCalculation', JSON.stringify(next))
  return next
}

export function clearCurrentCalculation() {
  localStorage.removeItem('simpleInterest_currentCalculation')
  return null
}

export function buildProjectionSeries(entry) {
  if (!isCalculationDataValid(entry)) {
    return []
  }

  const principal = Number(entry.principal)
  const rate = Number(entry.rate)
  const time = Number(entry.time)
  const unit = entry.unit === 'months' ? 'months' : 'years'
  const points = []
  const totalTicks = unit === 'months' ? Math.max(2, Math.min(12, Math.ceil(time))) : Math.max(2, Math.min(6, Math.ceil(time)))

  for (let index = 0; index <= totalTicks; index += 1) {
    const elapsed = unit === 'months' ? index / 12 : index
    const amount = principal + (principal * rate * elapsed) / 100
    points.push({
      year: index,
      label: unit === 'months' ? `${index} mo` : `${index} yr`,
      principal,
      interest: amount - principal,
      total: amount,
    })
  }

  return points
}
