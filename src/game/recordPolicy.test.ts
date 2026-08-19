import { describe, expect, it } from 'vitest'
import {
  shouldNoteSlow,
  shouldPersistSession,
  shouldRecordAttempt,
} from './recordPolicy.ts'

describe('shouldRecordAttempt', () => {
  it('does not record an answer that took more than 10 seconds', () => {
    expect(shouldRecordAttempt(10_001)).toBe(false)
  })

  it('records answers that took 10 seconds or less', () => {
    expect(shouldRecordAttempt(10_000)).toBe(true)
    expect(shouldRecordAttempt(800)).toBe(true)
  })
})

describe('shouldNoteSlow', () => {
  it('does not note the first question even when it is unusually long', () => {
    expect(shouldNoteSlow({ isFirstAttempt: true, flaggedByRule: true })).toBe(false)
  })

  it('notes later questions that the slow rule flags', () => {
    expect(shouldNoteSlow({ isFirstAttempt: false, flaggedByRule: true })).toBe(true)
    expect(shouldNoteSlow({ isFirstAttempt: false, flaggedByRule: false })).toBe(false)
  })
})

describe('shouldPersistSession', () => {
  it('does not persist when the user exits before the timer ends', () => {
    expect(shouldPersistSession({ completedNaturally: false, pageVisible: true })).toBe(false)
  })

  it('does not persist when the timer ends after the user has left', () => {
    expect(shouldPersistSession({ completedNaturally: true, pageVisible: false })).toBe(false)
  })

  it('persists a finished session while the play page is still visible', () => {
    expect(shouldPersistSession({ completedNaturally: true, pageVisible: true })).toBe(true)
  })
})
