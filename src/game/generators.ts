import { formatFraction } from './fractions.ts'
import { PERCENT_FRACTIONS } from './percentBank.ts'
import type { Category, Problem, Settings, SlowProblem } from './types.ts'

export type Rng = () => number

const UNLIKE_DENOMS = [2, 3, 4, 5, 6, 8, 10, 12] as const
const PERCENT_OF_PCTS = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 80]
const PERCENT_CHANGE_PCTS = [5, 10, 12.5, 20, 25, 30, 40, 50]

type PercentOfPair = { p: number; y: number; ans: number }
type PercentChangePair = {
  x: number
  p: number
  dir: 'increased' | 'decreased'
  ans: number
}

const PERCENT_OF_PAIRS: PercentOfPair[] = buildPercentOfPairs()
const PERCENT_CHANGE_PAIRS: PercentChangePair[] = buildPercentChangePairs()

export function enabledCategories(settings: Settings): Category[] {
  const cats: Category[] = []
  if (settings.addition.enabled) cats.push('addition')
  if (settings.subtraction.enabled) cats.push('subtraction')
  if (settings.multiplication.enabled) cats.push('multiplication')
  if (settings.division.enabled) cats.push('division')
  if (settings.squares.enabled) cats.push('squares')
  if (settings.cubes.enabled) cats.push('cubes')
  if (settings.power2.enabled) cats.push('power2')
  if (settings.power5.enabled) cats.push('power5')
  if (settings.percentFraction.enabled) cats.push('percentFraction')
  if (settings.unlikeDenom.enabled) cats.push('unlikeDenom')
  if (settings.percentOf.enabled) cats.push('percentOf')
  if (settings.percentChange.enabled) cats.push('percentChange')
  return cats
}

export function generateProblem(
  settings: Settings,
  rng: Rng = Math.random,
  slowBank: SlowProblem[] = [],
  previous?: Problem,
): Problem {
  if (settings.mode === 'slow-practice') {
    if (slowBank.length === 0) {
      throw new Error('No slow problems to practice')
    }
    const pool = excludePrevious(slowBank, previous)
    return replaySlow(pick(pool, rng))
  }

  const cats = enabledCategories(settings)
  if (cats.length === 0) {
    throw new Error('No problem types enabled')
  }
  const next = (): Problem => generateCategory(pick(cats, rng), settings, rng)
  const problem = next()
  if (!previous || problem.prompt !== previous.prompt) return problem
  for (let i = 0; i < 40; i++) {
    const candidate = next()
    if (candidate.prompt !== previous.prompt) return candidate
  }
  return problem
}

export function generateCategory(category: Category, settings: Settings, rng: Rng): Problem {
  switch (category) {
    case 'addition':
      return genAddition(settings, rng)
    case 'subtraction':
      return genSubtraction(settings, rng)
    case 'multiplication':
      return genMultiplication(settings, rng)
    case 'division':
      return genDivision(settings, rng)
    case 'squares':
      return genSquares(settings, rng)
    case 'cubes':
      return genCubes(settings, rng)
    case 'power2':
      return genPower2(settings, rng)
    case 'power5':
      return genPower5(settings, rng)
    case 'percentFraction':
      return genPercentFraction(rng)
    case 'unlikeDenom':
      return genUnlikeDenom(rng)
    case 'percentOf':
      return genPercentOf(rng)
    case 'percentChange':
      return genPercentChange(rng)
  }
}

function replaySlow(item: SlowProblem): Problem {
  return {
    category: item.category,
    prompt: item.prompt,
    answer: item.answer,
  }
}

function excludePrevious<T extends { prompt: string }>(
  items: readonly T[],
  previous?: Problem,
): readonly T[] {
  if (!previous) return items
  const filtered = items.filter((item) => item.prompt !== previous.prompt)
  return filtered.length > 0 ? filtered : items
}

function genAddition(settings: Settings, rng: Rng): Problem {
  const a = randInt(settings.addition.a.min, settings.addition.a.max, rng)
  const b = randInt(settings.addition.b.min, settings.addition.b.max, rng)
  return { category: 'addition', prompt: `${a} + ${b}`, answer: String(a + b) }
}

function genSubtraction(settings: Settings, rng: Rng): Problem {
  const a = randInt(settings.addition.a.min, settings.addition.a.max, rng)
  const b = randInt(settings.addition.b.min, settings.addition.b.max, rng)
  const c = a + b
  if (rng() < 0.5) {
    return { category: 'subtraction', prompt: `${c} - ${a}`, answer: String(b) }
  }
  return { category: 'subtraction', prompt: `${c} - ${b}`, answer: String(a) }
}

function genMultiplication(settings: Settings, rng: Rng): Problem {
  const a = randInt(settings.multiplication.a.min, settings.multiplication.a.max, rng)
  const b = randInt(settings.multiplication.b.min, settings.multiplication.b.max, rng)
  return { category: 'multiplication', prompt: `${a} × ${b}`, answer: String(a * b) }
}

function genDivision(settings: Settings, rng: Rng): Problem {
  const a = randInt(settings.multiplication.a.min, settings.multiplication.a.max, rng)
  const b = randInt(settings.multiplication.b.min, settings.multiplication.b.max, rng)
  const c = a * b
  if (rng() < 0.5) {
    return { category: 'division', prompt: `${c} ÷ ${a}`, answer: String(b) }
  }
  return { category: 'division', prompt: `${c} ÷ ${b}`, answer: String(a) }
}

function genSquares(settings: Settings, rng: Rng): Problem {
  const n = randInt(settings.squares.min, settings.squares.max, rng)
  return { category: 'squares', prompt: `${n}²`, answer: String(n * n) }
}

function genCubes(settings: Settings, rng: Rng): Problem {
  const n = randInt(settings.cubes.min, settings.cubes.max, rng)
  return { category: 'cubes', prompt: `${n}³`, answer: String(n * n * n) }
}

function genPower2(settings: Settings, rng: Rng): Problem {
  const n = randInt(settings.power2.min, settings.power2.max, rng)
  return { category: 'power2', prompt: `2^${n}`, answer: String(2 ** n) }
}

function genPower5(settings: Settings, rng: Rng): Problem {
  const n = randInt(settings.power5.min, settings.power5.max, rng)
  return { category: 'power5', prompt: `5^${n}`, answer: String(5 ** n) }
}

function genPercentFraction(rng: Rng): Problem {
  const item = pick(PERCENT_FRACTIONS, rng)
  return { category: 'percentFraction', prompt: item.prompt, answer: item.answer }
}

function genUnlikeDenom(rng: Rng): Problem {
  for (let i = 0; i < 40; i++) {
    const b = pick(UNLIKE_DENOMS, rng)
    const d = pick(UNLIKE_DENOMS, rng)
    if (d === b) continue
    const a = randInt(1, b, rng)
    const c = randInt(1, d, rng)
    const add = rng() < 0.5
    const den = b * d
    if (add) {
      const num = a * d + c * b
      if (num === 0) continue
      return {
        category: 'unlikeDenom',
        prompt: `${a}/${b} + ${c}/${d}`,
        answer: formatFraction(num, den),
      }
    }
    const num = a * d - c * b
    if (num === 0) continue
    if (num < 0) {
      return {
        category: 'unlikeDenom',
        prompt: `${c}/${d} - ${a}/${b}`,
        answer: formatFraction(-num, den),
      }
    }
    return {
      category: 'unlikeDenom',
      prompt: `${a}/${b} - ${c}/${d}`,
      answer: formatFraction(num, den),
    }
  }
  return { category: 'unlikeDenom', prompt: '1/2 + 1/3', answer: '5/6' }
}

function genPercentOf(rng: Rng): Problem {
  const pair = pick(PERCENT_OF_PAIRS, rng)
  return { category: 'percentOf', prompt: `${formatPercent(pair.p)}% of ${pair.y}`, answer: String(pair.ans) }
}

function genPercentChange(rng: Rng): Problem {
  const pair = pick(PERCENT_CHANGE_PAIRS, rng)
  return {
    category: 'percentChange',
    prompt: `${pair.x} ${pair.dir} by ${formatPercent(pair.p)}%`,
    answer: String(pair.ans),
  }
}

export function randInt(min: number, max: number, rng: Rng): number {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return lo + Math.floor(rng() * (hi - lo + 1))
}

export function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty list')
  }
  return items[Math.floor(rng() * items.length)]!
}

function formatPercent(p: number): string {
  return Number.isInteger(p) ? String(p) : String(p)
}

function buildPercentOfPairs(): PercentOfPair[] {
  const pairs: PercentOfPair[] = []
  for (const p of PERCENT_OF_PCTS) {
    for (let y = 8; y <= 200; y++) {
      const prod = (y * p) / 100
      if (Number.isInteger(prod) && prod > 0) {
        pairs.push({ p, y, ans: prod })
      }
    }
  }
  return pairs
}

function buildPercentChangePairs(): PercentChangePair[] {
  const pairs: PercentChangePair[] = []
  for (const p of PERCENT_CHANGE_PCTS) {
    for (let x = 8; x <= 200; x++) {
      const up = (x * (100 + p)) / 100
      if (Number.isInteger(up) && up > 0) {
        pairs.push({ x, p, dir: 'increased', ans: up })
      }
      const down = (x * (100 - p)) / 100
      if (Number.isInteger(down) && down > 0) {
        pairs.push({ x, p, dir: 'decreased', ans: down })
      }
    }
  }
  return pairs
}
