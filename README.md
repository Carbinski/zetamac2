# Zetamac2

Local arithmetic trainer. It clones the [Zetamac](https://arithmetic.zetamac.com) loop (including auto-submit on a correct answer), adds extra mental-math types, and writes session data under `data/` for charts and slow-problem practice.

## Run

```bash
npm install && npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Other commands:

```bash
npm test
npm run build
```

`data/` is created on the first finished session and is gitignored.

## How it works

1. Settings: enable types, set addition/multiplication ranges, pick a duration (default 120s). Extra types start off.
2. Play: seconds left, score, prompt, one answer field. Each keystroke is checked; a match scores, records the attempt, and loads the next problem. Enter is never required. Unfinished problems when time runs out are not saved.
3. Results: score, play again, change settings, or open stats.
4. Stats: score-over-time (filterable by settings hash / labeled config), average time by category, weakest-category ranking, and the slow-problem table.
5. Practice slow problems: replays exact flagged prompts. The button is disabled until the bank has at least one entry.

## Slow-problem rule

After a category has at least 8 completed answers, an attempt is flagged if its time is greater than `1.5 ×` that category's running mean. The same prompt upserts (hit count and times) instead of adding a new row. Constants live in `server/analyze.ts` (`SLOW_MIN_ANSWERS`, `SLOW_FACTOR`).

## Data files

All paths are under `data/`.

### `sessions.jsonl`

One JSON object per finished session:

| Field | Meaning |
| --- | --- |
| `id` | Session id |
| `timestamp` | ISO timestamp |
| `settings` | Full settings object used for the run |
| `settingsHash` | Stable hash of enabled types, ranges, duration, and mode |
| `settingsLabel` | Short label for charts (example: `Add+Sub+Mul+Div, 120s`) |
| `duration` | Duration in seconds |
| `score` | Correct answers |
| `attemptCount` | Same as score (only completed problems) |
| `meanTime` | Mean attempt time in ms, or 0 if none |

### `attempts.jsonl`

One JSON object per completed problem:

| Field | Meaning |
| --- | --- |
| `category` | Problem type |
| `prompt` | Shown text |
| `answer` | Canonical answer |
| `timeMs` | Time from prompt to correct input |
| `sessionId` | Parent session |
| `settingsHash` | Hash from that session |
| `flaggedSlow` | Whether this attempt exceeded the slow rule |

### `category-stats.json`

Running Welford stats per category: `n`, `mean`, `m2`.

### `slow-problems.json`

Object keyed by prompt. Each value has `prompt`, `category`, `answer`, `count`, `lastTimeMs`, `avgTimeMs`.
