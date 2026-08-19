import { useEffect, useRef, useState } from 'react'
import { checkAnswer } from '../game/checkAnswer.ts'
import { generateProblem } from '../game/generators.ts'
import { settingsHash, settingsLabel } from '../game/settingsHash.ts'
import type { AttemptInput, SessionRecord, Settings, SlowProblem } from '../game/types.ts'
import { saveSession } from '../persist/api.ts'

type Props = {
  settings: Settings
  slowBank: SlowProblem[]
  onFinished: (result: { score: number; attemptCount: number }) => void
}

export function PlayPage({ settings, slowBank, onFinished }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.durationSeconds)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [problem, setProblem] = useState(() => generateProblem(settings, Math.random, slowBank))
  const inputRef = useRef<HTMLInputElement>(null)
  const attemptsRef = useRef<AttemptInput[]>([])
  const startedAtRef = useRef(Date.now())
  const endAtRef = useRef(Date.now() + settings.durationSeconds * 1000)
  const finishedRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [problem])

  useEffect(() => {
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left === 0) {
        void finish()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [])

  async function finish(): Promise<void> {
    if (finishedRef.current) return
    finishedRef.current = true
    const attempts = attemptsRef.current
    const meanTime =
      attempts.length === 0 ? 0 : attempts.reduce((sum, row) => sum + row.timeMs, 0) / attempts.length
    const session: SessionRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      settings,
      settingsHash: settingsHash(settings),
      settingsLabel: settingsLabel(settings),
      duration: settings.durationSeconds,
      score: attempts.length,
      attemptCount: attempts.length,
      meanTime,
    }
    try {
      await saveSession(session, attempts)
    } catch (err) {
      console.error(err)
    }
    onFinished({ score: attempts.length, attemptCount: attempts.length })
  }

  function onInput(value: string): void {
    if (finishedRef.current) return
    setInput(value)
    if (!checkAnswer(value, problem.answer)) return
    const timeMs = Date.now() - startedAtRef.current
    attemptsRef.current.push({
      category: problem.category,
      prompt: problem.prompt,
      answer: problem.answer,
      timeMs,
    })
    setScore(attemptsRef.current.length)
    setInput('')
    setProblem(generateProblem(settings, Math.random, slowBank))
    startedAtRef.current = Date.now()
  }

  return (
    <main>
      <p>
        Seconds left: {secondsLeft} &nbsp; Score: {score}
      </p>
      <p className="prompt">{problem.prompt}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <input
          ref={inputRef}
          value={input}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => onInput(e.target.value)}
        />
      </form>
    </main>
  )
}
