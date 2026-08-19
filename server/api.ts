import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'
import { addLifetimeCounts, lifetimeFromCategoryStats } from '../src/game/lifetime.ts'
import { shouldRecordAttempt } from '../src/game/recordPolicy.ts'
import type { LifetimeMetrics } from '../src/game/types.ts'
import {
  processAttempt,
  type CategoryStat,
  type SlowProblemRecord,
} from './analyze.ts'

const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.jsonl')
const ATTEMPTS_FILE = path.join(DATA_DIR, 'attempts.jsonl')
const STATS_FILE = path.join(DATA_DIR, 'category-stats.json')
const SLOW_FILE = path.join(DATA_DIR, 'slow-problems.json')
const LIFETIME_FILE = path.join(DATA_DIR, 'lifetime.json')

type SessionBody = {
  session: {
    id: string
    timestamp: string
    settings: unknown
    settingsHash: string
    settingsLabel: string
    duration: number
    score: number
    attemptCount: number
    meanTime: number
  } | null
  attempts: Array<{
    category: string
    prompt: string
    answer: string
    timeMs: number
  }>
  answers: Array<{ category: string }>
}

export function zetamacApiPlugin(): Plugin {
  return {
    name: 'zetamac-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0] ?? ''
        if (!url.startsWith('/api/')) {
          next()
          return
        }
        void handleApi(req, res).catch((err: unknown) => {
          console.error(err)
          if (!res.writableEnded) {
            sendJson(res, 500, { error: 'internal' })
          }
        })
      })
    },
  }
}

async function handleApi(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = (req.url ?? '').split('?')[0] ?? ''

  if (req.method === 'GET' && url === '/api/stats') {
    sendJson(res, 200, readStats())
    return
  }

  if (req.method === 'GET' && url === '/api/slow-problems') {
    sendJson(res, 200, Object.values(readJson(SLOW_FILE, {} as Record<string, SlowProblemRecord>)))
    return
  }

  if (req.method === 'POST' && url === '/api/session') {
    const body = parseSession(await readBody(req))
    if (!body) {
      sendJson(res, 400, { error: 'invalid session payload' })
      return
    }
    const recorded = persistSession(body)
    sendJson(res, 200, recorded)
    return
  }

  sendJson(res, 404, { error: 'not found' })
}

function persistSession(body: SessionBody): { flagged: number } {
  ensureDataDir()
  const stats = readJson<Record<string, CategoryStat>>(STATS_FILE, {})
  const bank = readJson<Record<string, SlowProblemRecord>>(SLOW_FILE, {})
  const lifetime = readLifetime(stats)
  writeJson(LIFETIME_FILE, addLifetimeCounts(lifetime, body.answers))
  let flagged = 0

  if (body.session) {
    appendJsonl(SESSIONS_FILE, body.session)

    for (const [index, attempt] of body.attempts.entries()) {
      if (!shouldRecordAttempt(attempt.timeMs)) continue
      const flaggedSlow = processAttempt(stats, bank, attempt, { isFirstAttempt: index === 0 })
      if (flaggedSlow) flagged += 1
      appendJsonl(ATTEMPTS_FILE, {
        category: attempt.category,
        prompt: attempt.prompt,
        answer: attempt.answer,
        timeMs: attempt.timeMs,
        sessionId: body.session.id,
        settingsHash: body.session.settingsHash,
        flaggedSlow,
      })
    }

    writeJson(STATS_FILE, stats)
    writeJson(SLOW_FILE, bank)
  }

  return { flagged }
}

function readLifetime(stats: Record<string, CategoryStat>): LifetimeMetrics {
  if (fs.existsSync(LIFETIME_FILE)) {
    return readJson<LifetimeMetrics>(LIFETIME_FILE, { answered: 0, byCategory: {} })
  }
  return lifetimeFromCategoryStats(stats)
}

function readStats(): {
  sessions: unknown[]
  categoryStats: Record<string, CategoryStat>
  slowProblems: SlowProblemRecord[]
  lifetime: LifetimeMetrics
} {
  const categoryStats = readJson<Record<string, CategoryStat>>(STATS_FILE, {})
  return {
    sessions: readJsonl(SESSIONS_FILE),
    categoryStats,
    slowProblems: Object.values(readJson(SLOW_FILE, {} as Record<string, SlowProblemRecord>)),
    lifetime: readLifetime(categoryStats),
  }
}

function parseSession(raw: string): SessionBody | null {
  try {
    const data = JSON.parse(raw) as SessionBody
    const answers = Array.isArray(data.answers)
      ? data.answers
      : Array.isArray(data.attempts)
        ? data.attempts
        : null
    if (!answers) return null
    if (data.session != null && !data.session.id) return null
    return {
      session: data.session ?? null,
      attempts: Array.isArray(data.attempts) ? data.attempts : [],
      answers,
    }
  } catch {
    return null
  }
}

function ensureDataDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function appendJsonl(file: string, value: unknown): void {
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8')
}

function readJsonl(file: string): unknown[] {
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as unknown)
}

function readJson<T>(file: string, fallback: T): T {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}
