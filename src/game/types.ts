export type DurationSeconds = 30 | 60 | 120 | 300 | 600

export type PlayMode = 'normal' | 'slow-practice'

export type Range = {
  min: number
  max: number
}

export type Category =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'squares'
  | 'cubes'
  | 'power2'
  | 'power5'
  | 'percentFraction'
  | 'unlikeDenom'
  | 'percentOf'
  | 'percentChange'

export type Settings = {
  mode: PlayMode
  durationSeconds: DurationSeconds
  addition: { enabled: boolean; a: Range; b: Range }
  subtraction: { enabled: boolean }
  multiplication: { enabled: boolean; a: Range; b: Range }
  division: { enabled: boolean }
  squares: { enabled: boolean; min: number; max: number }
  cubes: { enabled: boolean; min: number; max: number }
  power2: { enabled: boolean; min: number; max: number }
  power5: { enabled: boolean; min: number; max: number }
  percentFraction: { enabled: boolean }
  unlikeDenom: { enabled: boolean }
  percentOf: { enabled: boolean }
  percentChange: { enabled: boolean }
}

export type Problem = {
  category: Category
  prompt: string
  answer: string
}

export type SlowProblem = {
  prompt: string
  category: Category
  answer: string
  count: number
  lastTimeMs: number
  avgTimeMs: number
}

export type AttemptInput = {
  category: Category
  prompt: string
  answer: string
  timeMs: number
}

export type AttemptRecord = AttemptInput & {
  sessionId: string
  settingsHash: string
  flaggedSlow: boolean
}

export type SessionRecord = {
  id: string
  timestamp: string
  settings: Settings
  settingsHash: string
  settingsLabel: string
  duration: number
  score: number
  attemptCount: number
  meanTime: number
}

export type CategoryStat = {
  n: number
  mean: number
  m2: number
}

export type StatsPayload = {
  sessions: SessionRecord[]
  categoryStats: Record<string, CategoryStat>
  slowProblems: SlowProblem[]
}

export const CATEGORY_LABELS: Record<Category, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  squares: 'Squares',
  cubes: 'Cubes',
  power2: '2^n',
  power5: '5^n',
  percentFraction: 'Percent to fraction',
  unlikeDenom: 'Unlike-denominator',
  percentOf: 'Percent of',
  percentChange: 'Percent change',
}

export const DURATIONS: DurationSeconds[] = [30, 60, 120, 300, 600]

export const ALL_CATEGORIES: Category[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'squares',
  'cubes',
  'power2',
  'power5',
  'percentFraction',
  'unlikeDenom',
  'percentOf',
  'percentChange',
]
