import { useEffect, useState } from 'react'
import { cloneSettings, DEFAULT_SETTINGS } from './game/defaults.ts'
import type { Settings, SlowProblem } from './game/types.ts'
import { PlayPage } from './pages/Play.tsx'
import { ResultsPage } from './pages/Results.tsx'
import { SettingsPage } from './pages/Settings.tsx'
import { StatsPage } from './pages/Stats.tsx'
import { fetchSlowProblems } from './persist/api.ts'

type Screen = 'settings' | 'play' | 'results' | 'stats'

export default function App() {
  const [screen, setScreen] = useState<Screen>('settings')
  const [settings, setSettings] = useState<Settings>(() => cloneSettings(DEFAULT_SETTINGS))
  const [playSettings, setPlaySettings] = useState<Settings>(() => cloneSettings(DEFAULT_SETTINGS))
  const [slowBank, setSlowBank] = useState<SlowProblem[]>([])
  const [score, setScore] = useState(0)
  const [playKey, setPlayKey] = useState(0)

  useEffect(() => {
    if (screen !== 'settings' && screen !== 'stats') return
    void fetchSlowProblems()
      .then(setSlowBank)
      .catch(() => setSlowBank([]))
  }, [screen])

  function beginPlay(next: Settings): void {
    setSettings(next)
    setPlaySettings(next)
    setPlayKey((key) => key + 1)
    setScreen('play')
  }

  function startNormal(): void {
    beginPlay({ ...settings, mode: 'normal' })
  }

  function startSlowPractice(): void {
    beginPlay({ ...settings, mode: 'slow-practice' })
  }

  function playAgain(): void {
    setPlayKey((key) => key + 1)
    setScreen('play')
  }

  if (screen === 'play') {
    return (
      <PlayPage
        key={playKey}
        settings={playSettings}
        slowBank={slowBank}
        onFinished={(result) => {
          setScore(result.score)
          setScreen('results')
        }}
      />
    )
  }

  if (screen === 'results') {
    return (
      <ResultsPage
        score={score}
        onPlayAgain={playAgain}
        onChangeSettings={() => {
          setSettings((current) => ({ ...current, mode: 'normal' }))
          setScreen('settings')
        }}
        onOpenStats={() => setScreen('stats')}
      />
    )
  }

  if (screen === 'stats') {
    return <StatsPage onBack={() => setScreen('settings')} />
  }

  return (
    <SettingsPage
      settings={settings}
      onChange={setSettings}
      slowBank={slowBank}
      onStart={startNormal}
      onPracticeSlow={startSlowPractice}
      onOpenStats={() => setScreen('stats')}
    />
  )
}
