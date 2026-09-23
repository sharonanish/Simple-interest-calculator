import { useEffect, useMemo, useState } from 'react'

import { clearCurrentCalculation, setCurrentCalculation } from '../../services/calculationService.js'
import { CustomSelect } from '../ui/CustomSelect.jsx'
import { calculateSimpleInterest } from '../../utils/simpleInterest.js'

const defaultForm = {
  principal: '',
  rate: '',
  time: '',
  interest: '',
  unit: 'years',
  mode: 'calculate-interest',
}

const modeOptions = [
  { value: 'calculate-interest', label: 'Calculate Interest' },
  { value: 'find-principal', label: 'Find Principal' },
  { value: 'find-rate', label: 'Find Interest Rate' },
  { value: 'find-time', label: 'Find Time' },
]

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function SimpleInterestCalculator({ onCalculate, initialResult }) {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(
    initialResult || {
      principal: 0,
      rate: 0,
      time: 0,
      totalAmount: 0,
      simpleInterest: 0,
      unit: 'years',
    },
  )

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult)
    }
  }, [initialResult])

  const showPrincipalField = form.mode !== 'find-principal'
  const showRateField = form.mode !== 'find-rate'
  const showTimeField = form.mode !== 'find-time'
  const showInterestField = form.mode !== 'calculate-interest'

  const insightText = useMemo(() => {
    const principalValue = Number(form.mode === 'find-principal' ? result.principal : form.principal || result.principal || 0)
    const rateValue = Number(form.mode === 'find-rate' ? result.rate : form.rate || result.rate || 0)
    const timeValue = Number(form.mode === 'find-time' ? result.time : form.time || result.time || 0)
    const durationLabel = form.unit === 'months' ? `${timeValue} Months` : `${timeValue} Years`
    return `At a ${rateValue}% simple interest rate over ${durationLabel}, your ${formatCurrency(principalValue)} principal generates ${formatCurrency(result.simpleInterest || 0)} in interest.`
  }, [form, result])

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextValue = value
    setForm((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: '' }))

    if (!nextValue || name === 'mode' || name === 'unit') {
      if (!nextValue) {
        clearCurrentCalculation()
      }
      return
    }

    const nextPayload = {
      principal: name === 'principal' ? Number(nextValue) : Number(form.principal || 0),
      rate: name === 'rate' ? Number(nextValue) : Number(form.rate || 0),
      time: name === 'time' ? Number(nextValue) : Number(form.time || 0),
      unit: form.unit,
      mode: form.mode,
    }

    if ([nextPayload.principal, nextPayload.rate, nextPayload.time].every((valueItem) => Number.isFinite(valueItem) && valueItem > 0)) {
      setCurrentCalculation(nextPayload)
    } else {
      clearCurrentCalculation()
    }
  }

  const handleModeChange = (value) => {
    setForm((current) => ({ ...current, mode: value }))
    setErrors((current) => ({ ...current, mode: '' }))
    const nextPayload = {
      principal: Number(form.principal || 0),
      rate: Number(form.rate || 0),
      time: Number(form.time || 0),
      unit: form.unit,
      mode: value,
    }

    if ([nextPayload.principal, nextPayload.rate, nextPayload.time].every((item) => Number.isFinite(item) && item > 0)) {
      setCurrentCalculation(nextPayload)
    } else {
      clearCurrentCalculation()
    }
  }

  const handleUnitChange = (value) => {
    setForm((current) => ({ ...current, unit: value }))
    setErrors((current) => ({ ...current, unit: '' }))
    const nextPayload = {
      principal: Number(form.principal || 0),
      rate: Number(form.rate || 0),
      time: Number(form.time || 0),
      unit: value,
      mode: form.mode,
    }

    if ([nextPayload.principal, nextPayload.rate, nextPayload.time].every((item) => Number.isFinite(item) && item > 0)) {
      setCurrentCalculation(nextPayload)
    } else {
      clearCurrentCalculation()
    }
  }

  const handleClear = () => {
    clearCurrentCalculation()
    setForm(defaultForm)
    setErrors({})
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      mode: form.mode,
      unit: form.unit,
      principal: showPrincipalField ? form.principal : undefined,
      rate: showRateField ? form.rate : undefined,
      time: showTimeField ? form.time : undefined,
      interest: showInterestField ? form.interest : undefined,
    }

    try {
      const nextResult = calculateSimpleInterest(payload)
      setResult(nextResult)
      setCurrentCalculation({
        ...nextResult,
        mode: form.mode,
        unit: form.unit,
      })
      setErrors({})
      onCalculate?.(nextResult, { ...form, mode: form.mode })
    } catch (error) {
      const message = error.message
      const nextErrors = {}
      if (message.includes('Principal')) nextErrors.principal = message
      if (message.includes('Rate')) nextErrors.rate = message
      if (message.includes('Time')) nextErrors.time = message
      if (message.includes('Interest')) nextErrors.interest = message
      setErrors(nextErrors)
    }
  }

  return (
    <div className="calculator-layout">
      <section className="panel calculator-panel">
        <div className="panel-header compact-header">
          <div>
            <p className="eyebrow">Calculator</p>
            <h3>Simple interest</h3>
          </div>
        </div>

        <form className="calculator-form" onSubmit={handleSubmit} noValidate>
          <div className="field-row stacked-row">
            <div className="field-group">
              <label className="label-heading" htmlFor="mode">Calculation Mode</label>
              <small className="helper-copy">Choose what you want to calculate.</small>
              <CustomSelect
                label=""
                className="mode-select"
                value={form.mode}
                onChange={handleModeChange}
                options={modeOptions}
                placeholder="Select a mode"
              />
            </div>

            <div className="field-group">
              <CustomSelect
                label="Time Unit"
                className="unit-select"
                value={form.unit}
                onChange={handleUnitChange}
                options={[
                  { value: 'years', label: 'Years' },
                  { value: 'months', label: 'Months' },
                ]}
              />
            </div>
          </div>

          {showPrincipalField && (
            <div className="field-group">
              <label htmlFor="principal">Principal Amount</label>
              <input
                id="principal"
                name="principal"
                type="number"
                min="0.01"
                step="0.01"
                value={form.principal}
                onChange={handleChange}
                placeholder="10000"
                aria-invalid={Boolean(errors.principal)}
              />
              {errors.principal && <span className="field-error">{errors.principal}</span>}
            </div>
          )}

          {showRateField && (
            <div className="field-group">
              <label htmlFor="rate">Interest Rate (%)</label>
              <input
                id="rate"
                name="rate"
                type="number"
                min="0"
                step="0.01"
                value={form.rate}
                onChange={handleChange}
                placeholder="5"
                aria-invalid={Boolean(errors.rate)}
              />
              {errors.rate && <span className="field-error">{errors.rate}</span>}
            </div>
          )}

          {showTimeField && (
            <div className="field-group">
              <label htmlFor="time">Time</label>
              <input
                id="time"
                name="time"
                type="number"
                min="0.01"
                step="0.01"
                value={form.time}
                onChange={handleChange}
                placeholder="2"
                aria-invalid={Boolean(errors.time)}
              />
              {errors.time && <span className="field-error">{errors.time}</span>}
            </div>
          )}

          {showInterestField && (
            <div className="field-group">
              <label htmlFor="interest">Interest</label>
              <input
                id="interest"
                name="interest"
                type="number"
                min="0.01"
                step="0.01"
                value={form.interest}
                onChange={handleChange}
                placeholder="1000"
                aria-invalid={Boolean(errors.interest)}
              />
              {errors.interest && <span className="field-error">{errors.interest}</span>}
            </div>
          )}

          <div className="button-row">
            <button type="submit" className="primary-button">
              Calculate
            </button>
            <button type="button" className="secondary-button" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="panel results-panel" aria-live="polite">
        <div className="result-header">
          <p className="eyebrow">Results</p>
          <h3>Calculation summary</h3>
        </div>

        <div className="result-stack">
          <div className="result-card">
            <span>Principal</span>
            <strong>{formatCurrency(result.principal)}</strong>
          </div>

          <div className="result-card highlight">
            <span>Simple Interest</span>
            <strong>{formatCurrency(result.simpleInterest)}</strong>
          </div>

          <div className="result-card total-card">
            <span>Total Amount</span>
            <strong>{formatCurrency(result.totalAmount)}</strong>
          </div>
        </div>

        <div className="breakdown">
          <div>
            <span>Rate</span>
            <strong>{result.rate}%</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>
              {result.time} {result.unit === 'months' ? 'Months' : 'Years'}
            </strong>
          </div>
        </div>

        <div className="formula-block">
          <span className="formula-label">Formula used</span>
          <strong>{result.formula || 'Simple Interest = (P × R × T) / 100'}</strong>
        </div>

        <div className="insight-inline">{insightText}</div>
      </section>
    </div>
  )
}
