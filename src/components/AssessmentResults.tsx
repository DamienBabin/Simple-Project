import { ASSESSMENT_CATEGORIES } from '../assessmentConfig'
import {
  determineProgressStatus,
  type CategoryScores,
  type MeetingChange,
  type SavedMeeting,
} from '../scorecard'
import { ScoreBar } from './ScoreBar'

type Opportunity = {
  id: string
  name: string
  score: number
  lowScoringQuestions: { text: string; score: number }[]
}

type AssessmentResultsProps = {
  clientName: string
  meetingDate: string
  overallScore: number
  categoryScores: CategoryScores
  opportunities: Opportunity[]
  wins: string[]
  previousMeeting?: SavedMeeting
  meetingChanges: MeetingChange[]
  overallChange?: number
  isAssessmentComplete: boolean
  totalQuestions: number
  formatMeetingDate: (meetingDate: string) => string
  onEditAssessment: () => void
  onPrint: () => void
  onDownloadPdf: () => void
  onSaveMeeting: () => void
  onNewAssessment: () => void
}

function changeClassName(change: number) {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

function formatChange(change: number) {
  return `${change > 0 ? '+' : ''}${change}%`
}

export function AssessmentResults({
  clientName,
  meetingDate,
  overallScore,
  categoryScores,
  opportunities,
  wins,
  previousMeeting,
  meetingChanges,
  overallChange,
  isAssessmentComplete,
  totalQuestions,
  formatMeetingDate,
  onEditAssessment,
  onPrint,
  onDownloadPdf,
  onSaveMeeting,
  onNewAssessment,
}: AssessmentResultsProps) {
  const canDownloadFinalReport = isAssessmentComplete && clientName.trim().length > 0

  return (
    <section className="content-section results-view">
      <div className="results-title">
        <div>
          <p className="eyebrow">Client assessment summary</p>
          <h2>{clientName || 'Client name not entered'}</h2>
          <p>{formatMeetingDate(meetingDate)}</p>
        </div>
        <div className={`score-seal ${determineProgressStatus(overallScore)}`}>
          <strong>{overallScore}%</strong><span>Overall score</span>
        </div>
      </div>

      {!isAssessmentComplete && (
        <div className="incomplete-message no-print">
          Results will become final after all {totalQuestions} questions are answered.
        </div>
      )}

      <div className="results-grid">
        <article className="result-card wide">
          <h3>Performance by category</h3>
          {ASSESSMENT_CATEGORIES.map((category) => (
            <div className="result-row" key={category.id}>
              <span>{category.name}</span>
              <ScoreBar percentage={categoryScores[category.id]} label={category.name} />
            </div>
          ))}
        </article>

        <article className="result-card">
          <span className="card-kicker">Focus next</span><h3>Top Opportunities</h3>
          <ol className="opportunity-list">
            {opportunities.map((opportunity) => (
              <li key={opportunity.id}>
                <div><span>{opportunity.name}</span><strong>{opportunity.score}%</strong></div>
                {opportunity.lowScoringQuestions.length > 0 && (
                  <ul className="low-question-list">
                    {opportunity.lowScoringQuestions.map((question) => (
                      <li key={question.text}>{question.text} <b>{question.score}/5</b></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </article>

        <article className="result-card">
          <span className="card-kicker">Celebrate progress</span><h3>Wins Unlocked</h3>
          {wins.length > 0 ? (
            <ul className="wins-list">
              {wins.map((win) => <li key={win}><span aria-hidden="true">★</span>{win}</li>)}
            </ul>
          ) : (
            <p className="empty-state">Complete and save a follow-up assessment to unlock improvement wins.</p>
          )}
        </article>

        <article className="result-card wide">
          <span className="card-kicker">Meeting to meeting</span><h3>Comparison with previous meeting</h3>
          {previousMeeting && overallChange !== undefined ? (
            <>
              <div className="overall-change">
                <span>Overall change since {formatMeetingDate(previousMeeting.meetingDate)}</span>
                <strong className={changeClassName(overallChange)}>{formatChange(overallChange)}</strong>
              </div>
              <div className="comparison-table">
                {meetingChanges.map((meetingChange) => (
                  <div className="comparison-row" key={meetingChange.categoryId}>
                    <strong>{meetingChange.categoryName}</strong>
                    <span>Previous {meetingChange.previousScore}%</span>
                    <span>Current {meetingChange.currentScore}%</span>
                    <span className={changeClassName(meetingChange.change)}>{formatChange(meetingChange.change)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-state">Save this assessment, then return for the next meeting to see category-by-category improvement.</p>
          )}
        </article>
      </div>

      <div className="action-bar no-print">
        <button className="secondary-button" onClick={onEditAssessment}>Edit assessment</button>
        <button className="secondary-button" onClick={onPrint}>Print Results</button>
        <button
          className="secondary-button"
          onClick={onDownloadPdf}
          disabled={!canDownloadFinalReport}
          title={canDownloadFinalReport ? 'Download the completed client report' : 'Enter a client name and complete every question first'}
        >
          Download Assessment PDF
        </button>
        <button className="primary-button" onClick={onSaveMeeting}>Save meeting</button>
        <button className="text-button" onClick={onNewAssessment}>Start new assessment</button>
      </div>
    </section>
  )
}
