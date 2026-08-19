export const SLOW_MIN_ANSWERS = 8
export const SLOW_FACTOR = 1.5

export type CategoryStat = {
  n: number
  mean: number
  m2: number
}

export type SlowProblemRecord = {
  prompt: string
  category: string
  answer: string
  count: number
  lastTimeMs: number
  avgTimeMs: number
}

export function updateWelford(stat: CategoryStat, x: number): CategoryStat {
  const n = stat.n + 1
  const delta = x - stat.mean
  const mean = stat.mean + delta / n
  const delta2 = x - mean
  const m2 = stat.m2 + delta * delta2
  return { n, mean, m2 }
}

export function shouldFlagSlow(stat: CategoryStat, timeMs: number): boolean {
  return stat.n >= SLOW_MIN_ANSWERS && timeMs > SLOW_FACTOR * stat.mean
}

export function upsertSlowProblem(
  bank: Record<string, SlowProblemRecord>,
  problem: { prompt: string; category: string; answer: string },
  timeMs: number,
): void {
  const existing = bank[problem.prompt]
  if (!existing) {
    bank[problem.prompt] = {
      prompt: problem.prompt,
      category: problem.category,
      answer: problem.answer,
      count: 1,
      lastTimeMs: timeMs,
      avgTimeMs: timeMs,
    }
    return
  }
  const count = existing.count + 1
  bank[problem.prompt] = {
    ...existing,
    count,
    lastTimeMs: timeMs,
    avgTimeMs: (existing.avgTimeMs * existing.count + timeMs) / count,
  }
}

export function processAttempt(
  stats: Record<string, CategoryStat>,
  bank: Record<string, SlowProblemRecord>,
  attempt: { category: string; prompt: string; answer: string; timeMs: number },
): boolean {
  const prev = stats[attempt.category] ?? { n: 0, mean: 0, m2: 0 }
  const next = updateWelford(prev, attempt.timeMs)
  stats[attempt.category] = next
  const flagged = shouldFlagSlow(next, attempt.timeMs)
  if (flagged) {
    upsertSlowProblem(bank, attempt, attempt.timeMs)
  }
  return flagged
}
