import { useEffect, useMemo, useState } from 'react'

import { ScenarioComparisonChart } from '../components/dashboard/ScenarioComparisonChart.jsx'
import { WhatIfAnalysis } from '../components/dashboard/WhatIfAnalysis.jsx'
import { SimpleInterestCalculator } from '../components/calculator/SimpleInterestCalculator.jsx'
import { getCurrentCalculation } from '../services/calculationService.js'
import { addHistoryEntry, getHistory, getLastCalculation, isValidCalculationRecord, setLastCalculation } from '../services/historyService.js'
import { addReport } from '../services/reportService.js'
import { calculateSimpleInterest } from '../utils/simpleInterest.js'

export function CalculatorPage() {
  const [result, setResult] = useState({
    principal: 0,
    rate: 0,
    time: 0,
    totalAmount: 0,
    simpleInterest: 0,
    unit: 'years',
  })

  const [historySnapshot, setHistorySnapshot] = useState(() => ({
    principal: 0,
    rate: 0,
    time: 0,
    unit: 'years',
    mode: 'calculate-interest',
  }))
  const [historyVersion, setHistoryVersion] = useState(0)
  const [selectedPreviousId, setSelectedPreviousId] = useState('')
  const [whatIfValues, setWhatIfValues] = useState(() => ({
    principal: 0,
    rate: 0,
    time: 0,
    unit: 'years',
  }))

  const currentCalculation = getCurrentCalculation() || result
  const historyEntries = getHistory()
  const previousOptions = historyEntries.filter((entry) => entry && entry.id && entry.id !== selectedPreviousId)
  const selectedPrevious = useMemo(() => {
    if (!selectedPreviousId) {
      return previousOptions[0] || null
    }

    return historyEntries.find((entry) => entry.id === selectedPreviousId) || previousOptions[0] || null
  }, [historyEntries, previousOptions, selectedPreviousId])

  const insightText = useMemo(() => {
    const durationLabel = historySnapshot.unit === 'months' ? `${historySnapshot.time} Months` : `${historySnapshot.time} Years`
    return `At a ${historySnapshot.rate}% simple interest rate over ${durationLabel}, your ₹${Number(historySnapshot.principal || 0).toLocaleString('en-IN')} principal generates ₹${Number(result.simpleInterest || 0).toLocaleString('en-IN')} in interest.`
  }, [historySnapshot, result.simpleInterest])

  const handleCalculate = (nextResult, nextForm) => {
    setResult(nextResult)
    setHistorySnapshot(nextForm)
    setWhatIfValues({
      principal: nextResult.principal,
      rate: nextResult.rate,
      time: nextResult.time,
      unit: nextResult.unit,
    })

    const record = {
      mode: nextForm.mode,
      principal: nextResult.principal,
      rate: nextResult.rate,
      time: nextResult.time,
      timeUnit: nextResult.unit,
      interest: nextResult.simpleInterest,
      totalAmount: nextResult.totalAmount,
      date: new Date().toISOString(),
    }

    addHistoryEntry(record)
    setLastCalculation(record)
  }

  const handleGenerateReport = () => {
    const report = addReport({
      name: 'Simple Interest Summary',
      type: 'Simple Interest',
      principal: result.principal,
      rate: result.rate,
      time: result.time,
      timeUnit: result.unit,
      interest: result.simpleInterest,
      totalAmount: result.totalAmount,
      status: 'Generated',
      date: new Date().toISOString(),
    })

    if (report && report[0]) {
      setLastCalculation({
        ...result,
        mode: historySnapshot.mode,
        timeUnit: result.unit,
        date: new Date().toISOString(),
      })
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const saved = getLastCalculation()
    if (saved && isValidCalculationRecord(saved)) {
      const derived = calculateSimpleInterest({
        principal: saved.principal,
        rate: saved.rate,
        time: saved.time,
        unit: saved.timeUnit || saved.unit || 'years',
        mode: saved.mode || 'calculate-interest',
      })

      setResult(derived)
      setHistorySnapshot({
        principal: saved.principal,
        rate: saved.rate,
        time: saved.time,
        unit: saved.timeUnit || saved.unit || 'years',
        mode: saved.mode || 'calculate-interest',
      })
    }
  }, [])

  useEffect(() => {
    const handleHistoryChange = () => setHistoryVersion((value) => value + 1)
    window.addEventListener('history-changed', handleHistoryChange)
    return () => window.removeEventListener('history-changed', handleHistoryChange)
  }, [])

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Calculator</p>
        <h2>Simple interest dashboard</h2>
      </div>

      <div className="projected-value-card dashboard-card">
        <div className="projected-value-header">
          <span>Projected value</span>
          <small>{currentCalculation && Number(currentCalculation.principal) > 0 && Number(currentCalculation.time) > 0 ? 'Live calculation' : 'Empty state'}</small>
        </div>
        <div className="projected-value-body">
          {currentCalculation && Number(currentCalculation.principal) > 0 && Number(currentCalculation.time) > 0 ? (
            <>
              <strong>₹{Number(currentCalculation.totalAmount || 0).toLocaleString('en-IN')}</strong>
              <small>+₹{Number((currentCalculation.totalAmount || 0) - (currentCalculation.principal || 0)).toLocaleString('en-IN')} over {Number(currentCalculation.time)} {currentCalculation.unit === 'months' ? 'months' : 'years'}</small>
            </>
          ) : (
            <>
              <strong>—</strong>
              <small>Calculate an amount to see your projection.</small>
            </>
          )}
        </div>
      </div>

      <SimpleInterestCalculator onCalculate={handleCalculate} initialResult={result} />

      <section className="insight-banner">
        <p>{insightText}</p>
      </section>

      <section className="dashboard-sections">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Scenario comparison</p>
              <h3>Compare With Previous Calculation</h3>
            </div>
          </div>

          {historyEntries.length === 0 ? (
            <div className="chart-empty-state" role="status" aria-live="polite">
              <div className="chart-empty-icon">↗</div>
              <p>No previous calculations available for comparison.</p>
            </div>
          ) : (
            <div className="comparison-controls">
              <label htmlFor="previousCalculation">Previous Calculation</label>
              <select id="previousCalculation" value={selectedPrevious?.id || ''} onChange={(event) => setSelectedPreviousId(event.target.value)}>
                <option value="">Choose a previous calculation</option>
                {historyEntries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {new Date(entry.date).toLocaleDateString()} • ₹{Number(entry.principal).toLocaleString('en-IN')} • {entry.rate}% • {entry.time} {entry.timeUnit === 'months' ? 'Months' : 'Years'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(!currentCalculation || !currentCalculation.principal || !currentCalculation.time) ? (
            <div className="chart-empty-state" role="status" aria-live="polite">
              <div className="chart-empty-icon">↗</div>
              <p>No current calculation available.</p>
            </div>
          ) : !selectedPrevious ? (
            <div className="chart-empty-state" role="status" aria-live="polite">
              <div className="chart-empty-icon">↗</div>
              <p>Create another calculation to compare with a previous result.</p>
            </div>
          ) : (
            <ScenarioComparisonChart previous={selectedPrevious} current={currentCalculation} />
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">What if?</p>
              <h3>Adjust inputs to model the outcome</h3>
            </div>
            <button type="button" className="primary-button" onClick={handleGenerateReport}>Generate Report</button>
          </div>

          <div className="what-if-controls">
            <div className="field-group">
              <label>Principal</label>
              <input
                type="number"
                value={whatIfValues.principal}
                onChange={(event) => setWhatIfValues((current) => ({ ...current, principal: Number(event.target.value) || 0 }))}
              />
            </div>
            <div className="field-group">
              <label>Rate (%)</label>
              <input
                type="number"
                value={whatIfValues.rate}
                onChange={(event) => setWhatIfValues((current) => ({ ...current, rate: Number(event.target.value) || 0 }))}
              />
            </div>
            <div className="field-group">
              <label>Duration</label>
              <input
                type="number"
                value={whatIfValues.time}
                onChange={(event) => setWhatIfValues((current) => ({ ...current, time: Number(event.target.value) || 0 }))}
              />
            </div>
          </div>

          <WhatIfAnalysis initial={whatIfValues} />
        </div>
      </section>
    </>
  )
}
