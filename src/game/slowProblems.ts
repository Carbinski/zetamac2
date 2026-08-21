import { ALL_CATEGORIES, type Category, type SlowProblem } from './types.ts'

export function filterSlowProblems(
  problems: SlowProblem[],
  category: Category | '',
): SlowProblem[] {
  if (category === '') return problems
  return problems.filter((problem) => problem.category === category)
}

export function slowFilterOptions(
  problems: SlowProblem[],
): Array<{ category: Category; count: number }> {
  const counts = new Map<Category, number>()
  for (const problem of problems) {
    counts.set(problem.category, (counts.get(problem.category) ?? 0) + 1)
  }
  return ALL_CATEGORIES.filter((category) => counts.has(category)).map((category) => ({
    category,
    count: counts.get(category) ?? 0,
  }))
}
