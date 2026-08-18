type Props = {
  score: number
  onPlayAgain: () => void
  onChangeSettings: () => void
}

export function ResultsPage({ score, onPlayAgain, onChangeSettings }: Props) {
  return (
    <main>
      <h1>Results</h1>
      <p>Score: {score}</p>
      <p>
        <button type="button" onClick={onPlayAgain}>
          Play again
        </button>{' '}
        <button type="button" onClick={onChangeSettings}>
          Change settings
        </button>
      </p>
    </main>
  )
}
