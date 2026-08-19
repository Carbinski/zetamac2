export const IDLE_DISCARD_MS = 10_000

export function shouldRecordAttempt(timeMs: number): boolean {
  return timeMs <= IDLE_DISCARD_MS
}

export function shouldNoteSlow(args: {
  isFirstAttempt: boolean
  flaggedByRule: boolean
}): boolean {
  return !args.isFirstAttempt && args.flaggedByRule
}

export function shouldPersistSession(args: {
  completedNaturally: boolean
  pageVisible: boolean
}): boolean {
  return args.completedNaturally && args.pageVisible
}

export function recordableAttempts<T extends { timeMs: number }>(attempts: T[]): T[] {
  return attempts.filter((attempt) => shouldRecordAttempt(attempt.timeMs))
}

export function meanAttemptTime(attempts: Array<{ timeMs: number }>): number {
  if (attempts.length === 0) return 0
  return attempts.reduce((sum, row) => sum + row.timeMs, 0) / attempts.length
}
