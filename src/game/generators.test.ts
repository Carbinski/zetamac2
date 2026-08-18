import { describe, expect, it } from 'vitest'
import { checkAnswer } from './checkAnswer.ts'
import { cloneSettings, DEFAULT_SETTINGS } from './defaults.ts'
import { generateCategory, generateProblem, type Rng } from './generators.ts'
import { PERCENT_FRACTIONS } from './percentBank.ts'
import type { Category, Settings, SlowProblem } from './types.ts'

function mulberry32(seed: number): Rng {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function only(category: Category): Settings {
  const settings = cloneSettings(DEFAULT_SETTINGS)
  settings.addition.enabled = category === 'addition'
  settings.subtraction.enabled = category === 'subtraction'
  settings.multiplication.enabled = category === 'multiplication'
  settings.division.enabled = category === 'division'
  settings.squares.enabled = category === 'squares'
  settings.cubes.enabled = category === 'cubes'
  settings.power2.enabled = category === 'power2'
  settings.power5.enabled = category === 'power5'
  settings.percentFraction.enabled = category === 'percentFraction'
  settings.unlikeDenom.enabled = category === 'unlikeDenom'
  settings.percentOf.enabled = category === 'percentOf'
  settings.percentChange.enabled = category === 'percentChange'
  return settings
}

function many(category: Category, n = 80): ReturnType<typeof generateProblem>[] {
  const settings = only(category)
  const rng = mulberry32(category.length * 97 + n)
  return Array.from({ length: n }, () => generateProblem(settings, rng))
}

describe('generateProblem', () => {
  it('throws when no types are enabled', () => {
    const settings = only('addition')
    settings.addition.enabled = false
    expect(() => generateProblem(settings, () => 0)).toThrow('No problem types enabled')
  })

  it('samples only the enabled category', () => {
    for (const problem of many('squares', 20)) {
      expect(problem.category).toBe('squares')
    }
  })

  it('replays exact slow-problem prompts', () => {
    const settings = cloneSettings(DEFAULT_SETTINGS)
    settings.mode = 'slow-practice'
    const bank: SlowProblem[] = [
      {
        prompt: '7²',
        category: 'squares',
        answer: '49',
        count: 2,
        lastTimeMs: 3000,
        avgTimeMs: 2800,
      },
    ]
    const problem = generateProblem(settings, () => 0, bank)
    expect(problem).toEqual({ category: 'squares', prompt: '7²', answer: '49' })
  })

  it('throws when the slow-problem bank is empty', () => {
    const settings = cloneSettings(DEFAULT_SETTINGS)
    settings.mode = 'slow-practice'
    expect(() => generateProblem(settings, () => 0, [])).toThrow('No slow problems to practice')
  })
})

describe('core Zetamac generators', () => {
  it('builds addition within the configured ranges', () => {
    for (const problem of many('addition')) {
      const match = problem.prompt.match(/^(\d+) \+ (\d+)$/)
      expect(match).not.toBeNull()
      const a = Number(match![1])
      const b = Number(match![2])
      expect(a).toBeGreaterThanOrEqual(2)
      expect(a).toBeLessThanOrEqual(100)
      expect(b).toBeGreaterThanOrEqual(2)
      expect(b).toBeLessThanOrEqual(100)
      expect(problem.answer).toBe(String(a + b))
      expect(checkAnswer(problem.answer, String(a + b))).toBe(true)
    }
  })

  it('builds subtraction as reversed addition', () => {
    for (const problem of many('subtraction')) {
      const match = problem.prompt.match(/^(\d+) - (\d+)$/)
      expect(match).not.toBeNull()
      const c = Number(match![1])
      const sub = Number(match![2])
      const other = c - sub
      expect(problem.answer).toBe(String(other))
      expect(c).toBeGreaterThanOrEqual(4)
      expect(c).toBeLessThanOrEqual(200)
      expect(checkAnswer(String(other), problem.answer)).toBe(true)
    }
  })

  it('builds multiplication within the configured ranges', () => {
    for (const problem of many('multiplication')) {
      const match = problem.prompt.match(/^(\d+) × (\d+)$/)
      expect(match).not.toBeNull()
      const a = Number(match![1])
      const b = Number(match![2])
      expect(a).toBeGreaterThanOrEqual(2)
      expect(a).toBeLessThanOrEqual(12)
      expect(b).toBeGreaterThanOrEqual(2)
      expect(b).toBeLessThanOrEqual(100)
      expect(problem.answer).toBe(String(a * b))
    }
  })

  it('builds division as reversed multiplication', () => {
    for (const problem of many('division')) {
      const match = problem.prompt.match(/^(\d+) ÷ (\d+)$/)
      expect(match).not.toBeNull()
      const c = Number(match![1])
      const d = Number(match![2])
      expect(c % d).toBe(0)
      expect(problem.answer).toBe(String(c / d))
    }
  })
})

describe('extra-type generators', () => {
  it('squares n in 2-25', () => {
    for (const problem of many('squares')) {
      const match = problem.prompt.match(/^(\d+)²$/)
      expect(match).not.toBeNull()
      const n = Number(match![1])
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(25)
      expect(problem.answer).toBe(String(n * n))
    }
  })

  it('cubes n in 2-12', () => {
    for (const problem of many('cubes')) {
      const match = problem.prompt.match(/^(\d+)³$/)
      expect(match).not.toBeNull()
      const n = Number(match![1])
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(12)
      expect(problem.answer).toBe(String(n * n * n))
    }
  })

  it('computes 2^n for n in 0-12', () => {
    for (const problem of many('power2')) {
      const match = problem.prompt.match(/^2\^(\d+)$/)
      expect(match).not.toBeNull()
      const n = Number(match![1])
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(12)
      expect(problem.answer).toBe(String(2 ** n))
    }
  })

  it('computes 5^n for n in 1-6', () => {
    for (const problem of many('power5')) {
      const match = problem.prompt.match(/^5\^(\d+)$/)
      expect(match).not.toBeNull()
      const n = Number(match![1])
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(6)
      expect(problem.answer).toBe(String(5 ** n))
    }
  })

  it('draws percent-to-fraction prompts from the bank', () => {
    const prompts = new Set(PERCENT_FRACTIONS.map((item) => item.prompt))
    for (const problem of many('percentFraction')) {
      expect(prompts.has(problem.prompt)).toBe(true)
      const item = PERCENT_FRACTIONS.find((row) => row.prompt === problem.prompt)
      expect(item).toBeTruthy()
      expect(checkAnswer(problem.answer, item!.answer)).toBe(true)
    }
  })

  it('reduces unlike-denominator sums and differences', () => {
    for (const problem of many('unlikeDenom')) {
      const match = problem.prompt.match(/^(\d+)\/(\d+) ([+-]) (\d+)\/(\d+)$/)
      expect(match).not.toBeNull()
      const a = Number(match![1])
      const b = Number(match![2])
      const op = match![3]
      const c = Number(match![4])
      const d = Number(match![5])
      expect(b).not.toBe(d)
      const num = op === '+' ? a * d + c * b : a * d - c * b
      const den = b * d
      expect(num).not.toBe(0)
      expect(checkAnswer(problem.answer, `${num}/${den}`)).toBe(true)
      expect(problem.answer.includes('/') || /^-?\d+$/.test(problem.answer)).toBe(true)
      if (problem.answer.includes('/')) {
        const [n, dd] = problem.answer.split('/').map(Number)
        expect(Math.abs(n) < Math.abs(dd) || Math.abs(n) > Math.abs(dd) || Math.abs(n) === Math.abs(dd)).toBe(
          true,
        )
        expect(dd).toBeGreaterThan(1)
      }
    }
  })

  it('makes X% of Y an integer', () => {
    for (const problem of many('percentOf')) {
      const match = problem.prompt.match(/^(\d+(?:\.\d+)?)% of (\d+)$/)
      expect(match).not.toBeNull()
      const p = Number(match![1])
      const y = Number(match![2])
      const ans = (y * p) / 100
      expect(Number.isInteger(ans)).toBe(true)
      expect(problem.answer).toBe(String(ans))
      expect(checkAnswer(problem.answer, String(ans))).toBe(true)
    }
  })

  it('makes percent-change answers integers', () => {
    for (const problem of many('percentChange')) {
      const match = problem.prompt.match(/^(\d+) (increased|decreased) by (\d+(?:\.\d+)?)%$/)
      expect(match).not.toBeNull()
      const x = Number(match![1])
      const dir = match![2]
      const p = Number(match![3])
      const ans = dir === 'increased' ? (x * (100 + p)) / 100 : (x * (100 - p)) / 100
      expect(Number.isInteger(ans)).toBe(true)
      expect(problem.answer).toBe(String(ans))
    }
  })

  it('can generate each extra category directly', () => {
    const settings = DEFAULT_SETTINGS
    const rng = mulberry32(1)
    const extras: Category[] = [
      'squares',
      'cubes',
      'power2',
      'power5',
      'percentFraction',
      'unlikeDenom',
      'percentOf',
      'percentChange',
    ]
    for (const category of extras) {
      const problem = generateCategory(category, settings, rng)
      expect(problem.category).toBe(category)
      expect(problem.prompt.length).toBeGreaterThan(0)
      expect(problem.answer.length).toBeGreaterThan(0)
    }
  })
})
