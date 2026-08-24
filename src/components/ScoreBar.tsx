import { determineProgressStatus } from '../scorecard'

type ScoreBarProps = {
  percentage: number
  label: string
}

export function ScoreBar({ percentage, label }: ScoreBarProps) {
  const progressStatus = determineProgressStatus(percentage)

  return (
    <div className="score-bar" aria-label={`${label}: ${percentage}%`}>
      <div className="score-bar-track">
        <div className={`score-bar-fill ${progressStatus}`} style={{ width: `${percentage}%` }} />
      </div>
      <strong className={`score-value ${progressStatus}`}>{percentage}%</strong>
    </div>
  )
}
