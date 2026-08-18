import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATEGORY_LABELS, type Category, type StatsPayload } from '../game/types.ts'
import { fetchStats } from '../persist/api.ts'

type Props = {
  onBack: () => void
}

export function StatsPage({ onBack }: Props) {
  const [stats, setStats] = useState<StatsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hashFilter, setHashFilter] = useState('')

  useEffect(() => {
    void fetchStats()
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      })
  }, [])

  const configs = useMemo(() => {
    if (!stats) return []
    const seen = new Map<string, string>()
    for (const session of stats.sessions) {
      if (!seen.has(session.settingsHash)) {
        seen.set(session.settingsHash, session.settingsLabel)
      }
    }
    return [...seen.entries()].map(([hash, label]) => ({ hash, label }))
  }, [stats])

  const lineData = useMemo(() => {
    if (!stats) return []
    return stats.sessions
      .filter((session) => (hashFilter === '' ? true : session.settingsHash === hashFilter))
      .slice()
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((session, index) => ({
        i: index + 1,
        score: session.score,
        when: session.timestamp.slice(0, 16).replace('T', ' '),
        label: session.settingsLabel,
      }))
  }, [stats, hashFilter])

  const barData = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.categoryStats)
      .filter(([, stat]) => stat.n > 0)
      .map(([category, stat]) => ({
        category: CATEGORY_LABELS[category as Category] ?? category,
        meanMs: Math.round(stat.mean),
        n: stat.n,
      }))
      .sort((a, b) => b.meanMs - a.meanMs)
  }, [stats])

  const weakest = barData.slice(0, 5)
  const slow = (stats?.slowProblems ?? [])
    .slice()
    .sort((a, b) => b.avgTimeMs - a.avgTimeMs)

  return (
    <main>
      <h1>Stats</h1>
      <p>
        <button type="button" onClick={onBack}>
          Back to settings
        </button>
      </p>
      {error && <p>{error}</p>}
      {!stats && !error && <p>Loading...</p>}
      {stats && stats.sessions.length === 0 && <p>No sessions yet.</p>}
      {stats && stats.sessions.length > 0 && (
        <>
          <section>
            <h2>Score over time</h2>
            <label>
              Config:{' '}
              <select value={hashFilter} onChange={(e) => setHashFilter(e.target.value)}>
                <option value="">All configs</option>
                {configs.map((config) => (
                  <option key={config.hash} value={config.hash}>
                    {config.label} ({config.hash})
                  </option>
                ))}
              </select>
            </label>
            <div className="chart">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="i" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#333" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h2>Average time by category</h2>
            {barData.length === 0 ? (
              <p>No category times yet.</p>
            ) : (
              <div className="chart">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="meanMs" fill="#555" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section>
            <h2>Weakest categories</h2>
            {weakest.length === 0 ? (
              <p>Not enough data.</p>
            ) : (
              <ol>
                {weakest.map((row) => (
                  <li key={row.category}>
                    {row.category}: {row.meanMs} ms avg ({row.n} answers)
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}

      <section>
        <h2>Slow problems</h2>
        {slow.length === 0 ? (
          <p>None flagged yet. A category needs 8 answers before outliers are stored.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Prompt</th>
                <th>Category</th>
                <th>Times seen</th>
                <th>Avg time (ms)</th>
                <th>Last time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {slow.map((row) => (
                <tr key={row.prompt}>
                  <td>{row.prompt}</td>
                  <td>{CATEGORY_LABELS[row.category] ?? row.category}</td>
                  <td>{row.count}</td>
                  <td>{Math.round(row.avgTimeMs)}</td>
                  <td>{Math.round(row.lastTimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
