import { describe, expect, it } from 'vitest'
import { cloneSettings, DEFAULT_SETTINGS } from './defaults.ts'
import { settingsHash, settingsLabel } from './settingsHash.ts'

describe('settingsHash', () => {
  it('is stable for the same settings object shape', () => {
    const a = cloneSettings(DEFAULT_SETTINGS)
    const b = cloneSettings(DEFAULT_SETTINGS)
    expect(settingsHash(a)).toBe(settingsHash(b))
  })

  it('changes when duration changes', () => {
    const other = cloneSettings(DEFAULT_SETTINGS)
    other.durationSeconds = 60
    expect(settingsHash(other)).not.toBe(settingsHash(DEFAULT_SETTINGS))
  })

  it('changes when a range or enabled type changes', () => {
    const ranged = cloneSettings(DEFAULT_SETTINGS)
    ranged.addition.a.max = 50
    expect(settingsHash(ranged)).not.toBe(settingsHash(DEFAULT_SETTINGS))

    const extra = cloneSettings(DEFAULT_SETTINGS)
    extra.squares.enabled = true
    expect(settingsHash(extra)).not.toBe(settingsHash(DEFAULT_SETTINGS))
  })

  it('changes for slow-practice mode', () => {
    const practice = cloneSettings(DEFAULT_SETTINGS)
    practice.mode = 'slow-practice'
    expect(settingsHash(practice)).not.toBe(settingsHash(DEFAULT_SETTINGS))
  })
})

describe('settingsLabel', () => {
  it('labels default core types and duration', () => {
    expect(settingsLabel(DEFAULT_SETTINGS)).toBe('Add+Sub+Mul+Div, 120s')
  })

  it('labels slow-practice sessions', () => {
    const practice = cloneSettings(DEFAULT_SETTINGS)
    practice.mode = 'slow-practice'
    expect(settingsLabel(practice)).toBe('Slow practice, 120s')
  })
})
