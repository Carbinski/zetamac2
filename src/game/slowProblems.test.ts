import { describe, expect, it } from 'vitest'
import type { SlowProblem } from './types.ts'
import { filterSlowProblems, slowFilterOptions } from './slowProblems.ts'

function row(category: SlowProblem['category'], prompt: string): SlowProblem {
  return {
    prompt,
    category,
    answer: '1',
    count: 1,
    lastTimeMs: 5000,
    avgTimeMs: 5000,
  }
}

describe('filterSlowProblems', () => {
  const bank = [
    row('addition', '49 + 75'),
    row('subtraction', '112 - 55'),
    row('addition', '7 + 8'),
  ]

  it('returns every problem when no category is selected', () => {
    expect(filterSlowProblems(bank, '')).toEqual(bank)
  })

  it('keeps only problems in the selected category', () => {
    expect(filterSlowProblems(bank, 'addition')).toEqual([
      row('addition', '49 + 75'),
      row('addition', '7 + 8'),
    ])
  })
})

describe('slowFilterOptions', () => {
  it('lists categories that appear, in type order, with counts', () => {
    const bank = [
      row('subtraction', '112 - 55'),
      row('addition', '49 + 75'),
      row('addition', '7 + 8'),
      row('squares', '12²'),
    ]
    expect(slowFilterOptions(bank)).toEqual([
      { category: 'addition', count: 2 },
      { category: 'subtraction', count: 1 },
      { category: 'squares', count: 1 },
    ])
  })
})
