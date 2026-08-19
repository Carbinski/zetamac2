import { describe, expect, it } from 'vitest'
import {
  SLOW_FACTOR,
  SLOW_MIN_ANSWERS,
  processAttempt,
  shouldFlagSlow,
  updateWelford,
  upsertSlowProblem,
  type CategoryStat,
  type SlowProblemRecord,
} from './analyze.ts'

describe('updateWelford', () => {
  it('tracks count and mean', () => {
    let stat: CategoryStat = { n: 0, mean: 0, m2: 0 }
    for (const x of [1000, 1000, 1000]) {
      stat = updateWelford(stat, x)
    }
    expect(stat.n).toBe(3)
    expect(stat.mean).toBe(1000)
    expect(stat.m2).toBe(0)
  })
})

describe('shouldFlagSlow', () => {
  it('is a named 1.5x threshold after 8 answers', () => {
    expect(SLOW_MIN_ANSWERS).toBe(8)
    expect(SLOW_FACTOR).toBe(1.5)
  })

  it('does not flag before 8 answers', () => {
    const stat = { n: 7, mean: 1000, m2: 0 }
    expect(shouldFlagSlow(stat, 10_000)).toBe(false)
  })

  it('flags when time is above 1.5 times the mean', () => {
    const stat = { n: 8, mean: 1000, m2: 0 }
    expect(shouldFlagSlow(stat, 1500)).toBe(false)
    expect(shouldFlagSlow(stat, 1501)).toBe(true)
  })
})

describe('processAttempt', () => {
  it('flags the 8th answer when it is much slower than the running mean', () => {
    const stats: Record<string, CategoryStat> = {}
    const bank: Record<string, SlowProblemRecord> = {}
    for (let i = 0; i < 7; i++) {
      const flagged = processAttempt(stats, bank, {
        category: 'addition',
        prompt: `${i} + 1`,
        answer: String(i + 1),
        timeMs: 1000,
      })
      expect(flagged).toBe(false)
    }
    const flagged = processAttempt(stats, bank, {
      category: 'addition',
      prompt: '99 + 1',
      answer: '100',
      timeMs: 2000,
    })
    expect(stats.addition?.n).toBe(8)
    expect(flagged).toBe(true)
    expect(bank['99 + 1']?.count).toBe(1)
  })

  it('does not note a first-of-session answer even when it is unusually long', () => {
    const stats: Record<string, CategoryStat> = {
      addition: { n: 8, mean: 1000, m2: 0 },
    }
    const bank: Record<string, SlowProblemRecord> = {}
    const flagged = processAttempt(
      stats,
      bank,
      {
        category: 'addition',
        prompt: '40 + 2',
        answer: '42',
        timeMs: 4000,
      },
      { isFirstAttempt: true },
    )
    expect(flagged).toBe(false)
    expect(bank['40 + 2']).toBeUndefined()
    expect(stats.addition?.n).toBe(9)
  })

  it('does not flag an 8th answer near the mean', () => {
    const stats: Record<string, CategoryStat> = {}
    const bank: Record<string, SlowProblemRecord> = {}
    for (let i = 0; i < 8; i++) {
      const flagged = processAttempt(stats, bank, {
        category: 'squares',
        prompt: `${i}²`,
        answer: String(i * i),
        timeMs: 1000,
      })
      expect(flagged).toBe(false)
    }
    expect(Object.keys(bank)).toHaveLength(0)
  })
})

describe('upsertSlowProblem', () => {
  it('increments count for the same prompt instead of duplicating', () => {
    const bank: Record<string, SlowProblemRecord> = {}
    upsertSlowProblem(bank, { prompt: '7²', category: 'squares', answer: '49' }, 3000)
    upsertSlowProblem(bank, { prompt: '7²', category: 'squares', answer: '49' }, 1000)
    expect(Object.keys(bank)).toEqual(['7²'])
    expect(bank['7²']?.count).toBe(2)
    expect(bank['7²']?.lastTimeMs).toBe(1000)
    expect(bank['7²']?.avgTimeMs).toBe(2000)
  })
})
