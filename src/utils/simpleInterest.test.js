import test from 'node:test'
import assert from 'node:assert/strict'

import { isValidCalculationRecord } from '../services/historyService.js'
import { calculateSimpleInterest } from './simpleInterest.js'

test('calculates simple interest for yearly values', () => {
  const result = calculateSimpleInterest({ principal: 10000, rate: 5, time: 2, unit: 'years', mode: 'calculate-interest' })

  assert.equal(result.simpleInterest, 1000)
  assert.equal(result.totalAmount, 11000)
  assert.equal(result.normalizedTime, 2)
})

test('converts months before calculation', () => {
  const result = calculateSimpleInterest({ principal: 12000, rate: 6, time: 6, unit: 'months', mode: 'calculate-interest' })

  assert.equal(result.normalizedTime, 0.5)
  assert.equal(result.simpleInterest, 360)
  assert.equal(result.totalAmount, 12360)
})

test('rejects invalid principal, rate, and time', () => {
  assert.throws(() => calculateSimpleInterest({ principal: 0, rate: 5, time: 2, unit: 'years', mode: 'calculate-interest' }), /Principal/)
  assert.throws(() => calculateSimpleInterest({ principal: 1000, rate: -1, time: 2, unit: 'years', mode: 'calculate-interest' }), /Rate/)
  assert.throws(() => calculateSimpleInterest({ principal: 1000, rate: 5, time: 0, unit: 'years', mode: 'calculate-interest' }), /Time/)
})

test('finds principal from interest, rate, and time', () => {
  const result = calculateSimpleInterest({ interest: 1200, rate: 5, time: 2, unit: 'years', mode: 'find-principal' })

  assert.equal(result.principal, 12000)
  assert.equal(result.simpleInterest, 1200)
})

test('finds rate from principal, interest, and time', () => {
  const result = calculateSimpleInterest({ principal: 10000, interest: 1500, time: 3, unit: 'years', mode: 'find-rate' })

  assert.equal(result.rate, 5)
})

test('finds time from principal, rate, and interest', () => {
  const result = calculateSimpleInterest({ principal: 20000, rate: 4, interest: 1600, unit: 'years', mode: 'find-time' })

  assert.equal(result.time, 2)
})

test('converts month inputs when solving for time and rate', () => {
  const timeResult = calculateSimpleInterest({ principal: 20000, rate: 6, interest: 600, unit: 'months', mode: 'find-time' })
  assert.equal(timeResult.time, 6)

  const rateResult = calculateSimpleInterest({ principal: 10000, interest: 250, time: 6, unit: 'months', mode: 'find-rate' })
  assert.equal(rateResult.rate, 5)
})

test('rejects invalid or zero denominators for solved modes', () => {
  assert.throws(() => calculateSimpleInterest({ interest: 100, rate: 0, time: 2, unit: 'years', mode: 'find-principal' }), /Rate/)
  assert.throws(() => calculateSimpleInterest({ principal: 0, interest: 100, time: 2, unit: 'years', mode: 'find-rate' }), /Principal/)
  assert.throws(() => calculateSimpleInterest({ principal: 1000, rate: 0, interest: 100, unit: 'years', mode: 'find-time' }), /Rate/)
})

test('ignores invalid persisted last-calculation payloads', () => {
  assert.equal(isValidCalculationRecord(null), false)
  assert.equal(isValidCalculationRecord({ principal: 0, rate: 5, time: 2 }), false)
  assert.equal(isValidCalculationRecord({ principal: 10000, rate: 5, time: 2, mode: 'calculate-interest' }), true)
})
