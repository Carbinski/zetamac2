import type { DurationSeconds, Settings, SlowProblem } from '../game/types.ts'
import { DURATIONS } from '../game/types.ts'
import { enabledCategories } from '../game/generators.ts'

type Props = {
  settings: Settings
  onChange: (settings: Settings) => void
  slowBank: SlowProblem[]
  onStart: () => void
  onPracticeSlow: () => void
  onOpenStats: () => void
}

export function SettingsPage({
  settings,
  onChange,
  slowBank,
  onStart,
  onPracticeSlow,
  onOpenStats,
}: Props) {
  const canStart = enabledCategories(settings).length > 0
  const canPractice = slowBank.length > 0

  return (
    <main>
      <h1>Zetamac2</h1>
      <p>Local arithmetic trainer. Type the answer; a correct value submits on its own.</p>

      <section>
        <h2>Core types</h2>
        <label>
          <input
            type="checkbox"
            checked={settings.addition.enabled}
            onChange={(e) =>
              onChange({
                ...settings,
                addition: { ...settings.addition, enabled: e.target.checked },
              })
            }
          />
          Addition
        </label>
        <div>
          Range: ({' '}
          <Num
            value={settings.addition.a.min}
            onChange={(min) =>
              onChange({
                ...settings,
                addition: { ...settings.addition, a: { ...settings.addition.a, min } },
              })
            }
          />{' '}
          to{' '}
          <Num
            value={settings.addition.a.max}
            onChange={(max) =>
              onChange({
                ...settings,
                addition: { ...settings.addition, a: { ...settings.addition.a, max } },
              })
            }
          />{' '}
          ) + ({' '}
          <Num
            value={settings.addition.b.min}
            onChange={(min) =>
              onChange({
                ...settings,
                addition: { ...settings.addition, b: { ...settings.addition.b, min } },
              })
            }
          />{' '}
          to{' '}
          <Num
            value={settings.addition.b.max}
            onChange={(max) =>
              onChange({
                ...settings,
                addition: { ...settings.addition, b: { ...settings.addition.b, max } },
              })
            }
          />{' '}
          )
        </div>

        <label>
          <input
            type="checkbox"
            checked={settings.subtraction.enabled}
            onChange={(e) =>
              onChange({ ...settings, subtraction: { enabled: e.target.checked } })
            }
          />
          Subtraction
        </label>
        <div>Addition problems in reverse.</div>

        <label>
          <input
            type="checkbox"
            checked={settings.multiplication.enabled}
            onChange={(e) =>
              onChange({
                ...settings,
                multiplication: { ...settings.multiplication, enabled: e.target.checked },
              })
            }
          />
          Multiplication
        </label>
        <div>
          Range: ({' '}
          <Num
            value={settings.multiplication.a.min}
            onChange={(min) =>
              onChange({
                ...settings,
                multiplication: {
                  ...settings.multiplication,
                  a: { ...settings.multiplication.a, min },
                },
              })
            }
          />{' '}
          to{' '}
          <Num
            value={settings.multiplication.a.max}
            onChange={(max) =>
              onChange({
                ...settings,
                multiplication: {
                  ...settings.multiplication,
                  a: { ...settings.multiplication.a, max },
                },
              })
            }
          />{' '}
          ) × ({' '}
          <Num
            value={settings.multiplication.b.min}
            onChange={(min) =>
              onChange({
                ...settings,
                multiplication: {
                  ...settings.multiplication,
                  b: { ...settings.multiplication.b, min },
                },
              })
            }
          />{' '}
          to{' '}
          <Num
            value={settings.multiplication.b.max}
            onChange={(max) =>
              onChange({
                ...settings,
                multiplication: {
                  ...settings.multiplication,
                  b: { ...settings.multiplication.b, max },
                },
              })
            }
          />{' '}
          )
        </div>

        <label>
          <input
            type="checkbox"
            checked={settings.division.enabled}
            onChange={(e) => onChange({ ...settings, division: { enabled: e.target.checked } })}
          />
          Division
        </label>
        <div>Multiplication problems in reverse.</div>
      </section>

      <section>
        <h2>Extra types</h2>
        <label>
          <input
            type="checkbox"
            checked={settings.squares.enabled}
            onChange={(e) =>
              onChange({ ...settings, squares: { ...settings.squares, enabled: e.target.checked } })
            }
          />
          Squares (n^2 for n = 2-25)
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.cubes.enabled}
            onChange={(e) =>
              onChange({ ...settings, cubes: { ...settings.cubes, enabled: e.target.checked } })
            }
          />
          Cubes (n^3 for n = 2-12)
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.power2.enabled}
            onChange={(e) =>
              onChange({ ...settings, power2: { ...settings.power2, enabled: e.target.checked } })
            }
          />
          2^n (n = 0-12)
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.power5.enabled}
            onChange={(e) =>
              onChange({ ...settings, power5: { ...settings.power5, enabled: e.target.checked } })
            }
          />
          5^n (n = 1-6)
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.percentFraction.enabled}
            onChange={(e) =>
              onChange({ ...settings, percentFraction: { enabled: e.target.checked } })
            }
          />
          Percent to fraction
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.unlikeDenom.enabled}
            onChange={(e) => onChange({ ...settings, unlikeDenom: { enabled: e.target.checked } })}
          />
          Unlike-denominator +/-
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.percentOf.enabled}
            onChange={(e) => onChange({ ...settings, percentOf: { enabled: e.target.checked } })}
          />
          What is X% of Y
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.percentChange.enabled}
            onChange={(e) =>
              onChange({ ...settings, percentChange: { enabled: e.target.checked } })
            }
          />
          X increased/decreased by Y%
        </label>
      </section>

      <section>
        <label>
          Duration:{' '}
          <select
            value={settings.durationSeconds}
            onChange={(e) =>
              onChange({
                ...settings,
                durationSeconds: Number(e.target.value) as DurationSeconds,
              })
            }
          >
            {DURATIONS.map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds} seconds
              </option>
            ))}
          </select>
        </label>
      </section>

      <p>
        <button type="button" onClick={onStart} disabled={!canStart}>
          Start
        </button>{' '}
        <button type="button" onClick={onPracticeSlow} disabled={!canPractice}>
          Practice slow problems
        </button>{' '}
        <button type="button" onClick={onOpenStats}>
          Stats
        </button>
      </p>
      {!canPractice && <p>No slow problems yet. Play enough in a category to flag outliers.</p>}
    </main>
  )
}

function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}
