import type { Settings } from './types.ts'

export function settingsHash(settings: Settings): string {
  const payload = {
    mode: settings.mode,
    durationSeconds: settings.durationSeconds,
    addition: settings.addition,
    subtraction: settings.subtraction.enabled,
    multiplication: settings.multiplication,
    division: settings.division.enabled,
    squares: settings.squares,
    cubes: settings.cubes,
    power2: settings.power2,
    power5: settings.power5,
    percentFraction: settings.percentFraction.enabled,
    unlikeDenom: settings.unlikeDenom.enabled,
    percentOf: settings.percentOf.enabled,
    percentChange: settings.percentChange.enabled,
  }
  return fnv1a(JSON.stringify(payload))
}

export function settingsLabel(settings: Settings): string {
  if (settings.mode === 'slow-practice') {
    return `Slow practice, ${settings.durationSeconds}s`
  }
  const parts: string[] = []
  if (settings.addition.enabled) parts.push('Add')
  if (settings.subtraction.enabled) parts.push('Sub')
  if (settings.multiplication.enabled) parts.push('Mul')
  if (settings.division.enabled) parts.push('Div')
  if (settings.squares.enabled) parts.push('Squares')
  if (settings.cubes.enabled) parts.push('Cubes')
  if (settings.power2.enabled) parts.push('2^n')
  if (settings.power5.enabled) parts.push('5^n')
  if (settings.percentFraction.enabled) parts.push('Pct-frac')
  if (settings.unlikeDenom.enabled) parts.push('Unlike-denom')
  if (settings.percentOf.enabled) parts.push('Pct-of')
  if (settings.percentChange.enabled) parts.push('Pct-change')
  return `${parts.join('+')}, ${settings.durationSeconds}s`
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}
