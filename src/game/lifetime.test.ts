import { describe, expect, it } from 'vitest'
import { addLifetimeCounts, lifetimeFromCategoryStats } from './lifetime.ts'

describe('addLifetimeCounts', () => {
  it('counts every answer and how many times each type was answered', () => {
    const next = addLifetimeCounts(
      { answered: 0, byCategory: {} },
      [{ category: 'addition' }, { category: 'addition' }, { category: 'squares' }],
    )
    expect(next.answered).toBe(3)
    expect(next.byCategory.addition).toBe(2)
    expect(next.byCategory.squares).toBe(1)
  })

  it('adds onto existing lifetime totals', () => {
    const next = addLifetimeCounts({ answered: 10, byCategory: { addition: 7, division: 3 } }, [
      { category: 'division' },
    ])
    expect(next.answered).toBe(11)
    expect(next.byCategory.addition).toBe(7)
    expect(next.byCategory.division).toBe(4)
  })
})

describe('lifetimeFromCategoryStats', () => {
  it('seeds lifetime totals from existing category counts', () => {
    const seeded = lifetimeFromCategoryStats({
      addition: { n: 5 },
      squares: { n: 2 },
    })
    expect(seeded.answered).toBe(7)
    expect(seeded.byCategory).toEqual({ addition: 5, squares: 2 })
  })
})
