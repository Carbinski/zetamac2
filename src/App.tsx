import { useState } from 'react'
import { cloneSettings, DEFAULT_SETTINGS } from './game/defaults.ts'
import type { Settings } from './game/types.ts'
import { PlayPage } from './pages/Play.tsx'
import { ResultsPage } from './pages/Results.tsx'
import { SettingsPage } from './pages/Settings.tsx'

type Screen = 'settings' | 'play' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('settings')
  const [settings, setSettings] = useState<Settings>(() => cloneSettings(DEFAULT_SETTINGS))
  const [playSettings, setPlaySettings] = useState<Settings>(() => cloneSettings(DEFAULT_SETTINGS))
  const [score, setScore] = useState(0)
  const [playKey, setPlayKey] = useState(0)

  function beginPlay(next: Settings): void {
    setSettings(next)
    setPlaySettings(next)
    setPlayKey((key) => key + 1)
    setScreen('play')
  }

  function startNormal(): void {
    beginPlay({ ...settings, mode: 'normal' })
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
        slowBank={[]}
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
      />
    )
  }

  return <SettingsPage settings={settings} onChange={setSettings} onStart={startNormal} />
}
