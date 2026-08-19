import type { Settings } from './types.ts'

export const DEFAULT_SETTINGS: Settings = {
  mode: 'normal',
  durationSeconds: 120,
  addition: { enabled: true, a: { min: 2, max: 100 }, b: { min: 2, max: 100 } },
  subtraction: { enabled: true },
  multiplication: { enabled: true, a: { min: 2, max: 12 }, b: { min: 2, max: 100 } },
  division: { enabled: true },
  squares: { enabled: false, min: 2, max: 25 },
  cubes: { enabled: false, min: 2, max: 12 },
  power2: { enabled: false, min: 0, max: 12 },
  power5: { enabled: false, min: 1, max: 6 },
  percentFraction: { enabled: false },
  unlikeDenom: { enabled: false },
  percentOf: { enabled: false },
  percentChange: { enabled: false },
}

export function cloneSettings(settings: Settings): Settings {
  return structuredClone(settings)
}
