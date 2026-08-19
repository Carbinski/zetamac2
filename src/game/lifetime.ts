import type { LifetimeMetrics } from './types.ts'

export type { LifetimeMetrics }

export function addLifetimeCounts(
  current: LifetimeMetrics,
  answers: Array<{ category: string }>,
): LifetimeMetrics {
  const byCategory = { ...current.byCategory }
  for (const answer of answers) {
    byCategory[answer.category] = (byCategory[answer.category] ?? 0) + 1
  }
  return {
    answered: current.answered + answers.length,
    byCategory,
  }
}

export function lifetimeFromCategoryStats(
  stats: Record<string, { n: number }>,
): LifetimeMetrics {
  const byCategory: Record<string, number> = {}
  let answered = 0
  for (const [category, stat] of Object.entries(stats)) {
    if (stat.n <= 0) continue
    byCategory[category] = stat.n
    answered += stat.n
  }
  return { answered, byCategory }
}
