import { describe, expect, it } from 'vitest'
import { checkAnswer } from './checkAnswer.ts'
import { PERCENT_FRACTIONS } from './percentBank.ts'

describe('checkAnswer', () => {
  it('matches integers after trimming', () => {
    expect(checkAnswer('20', '20')).toBe(true)
    expect(checkAnswer(' 20 ', '20')).toBe(true)
    expect(checkAnswer('020', '20')).toBe(true)
  })

  it('rejects a wrong integer and incomplete prefixes', () => {
    expect(checkAnswer('1', '12')).toBe(false)
    expect(checkAnswer('12', '1')).toBe(false)
    expect(checkAnswer('', '12')).toBe(false)
    expect(checkAnswer('1', '1/8')).toBe(false)
  })

  it('accepts equivalent fractions via cross-multiply', () => {
    expect(checkAnswer('1/8', '1/8')).toBe(true)
    expect(checkAnswer('2/16', '1/8')).toBe(true)
    expect(checkAnswer('2 / 16', '1/8')).toBe(true)
    expect(checkAnswer('3/2', '3/2')).toBe(true)
    expect(checkAnswer('6/4', '3/2')).toBe(true)
  })

  it('accepts terminating decimal equivalents', () => {
    expect(checkAnswer('0.125', '1/8')).toBe(true)
    expect(checkAnswer('.125', '1/8')).toBe(true)
    expect(checkAnswer('1.5', '3/2')).toBe(true)
    expect(checkAnswer('1.50', '3/2')).toBe(true)
    expect(checkAnswer('0.25', '1/4')).toBe(true)
  })

  it('accepts an integer for a whole-number fraction', () => {
    expect(checkAnswer('2', '2/1')).toBe(true)
    expect(checkAnswer('2/1', '2')).toBe(true)
  })

  it('rejects 1/0 and other invalid input', () => {
    expect(checkAnswer('1/0', '1')).toBe(false)
    expect(checkAnswer('abc', '1')).toBe(false)
    expect(checkAnswer('1/', '1/8')).toBe(false)
  })

  it('matches every percent-fraction bank answer against itself', () => {
    for (const item of PERCENT_FRACTIONS) {
      expect(checkAnswer(item.answer, item.answer)).toBe(true)
    }
  })

  it('accepts known equivalent forms for finance percents', () => {
    expect(checkAnswer('2/16', '1/8')).toBe(true)
    expect(checkAnswer('0.125', '1/8')).toBe(true)
    expect(checkAnswer('2/6', '1/3')).toBe(true)
    expect(checkAnswer('4/12', '1/3')).toBe(true)
  })
})
