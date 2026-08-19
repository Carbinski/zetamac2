import type { AttemptInput, SessionRecord, SlowProblem, StatsPayload } from '../game/types.ts'

export async function saveSession(
  session: SessionRecord | null,
  attempts: AttemptInput[],
  answers: Array<{ category: AttemptInput['category'] }>,
): Promise<void> {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, attempts, answers }),
  })
  if (!res.ok) {
    throw new Error(`Failed to save session: ${res.status}`)
  }
}

export async function fetchStats(): Promise<StatsPayload> {
  const res = await fetch('/api/stats')
  if (!res.ok) {
    throw new Error(`Failed to load stats: ${res.status}`)
  }
  return (await res.json()) as StatsPayload
}

export async function fetchSlowProblems(): Promise<SlowProblem[]> {
  const res = await fetch('/api/slow-problems')
  if (!res.ok) {
    throw new Error(`Failed to load slow problems: ${res.status}`)
  }
  return (await res.json()) as SlowProblem[]
}
