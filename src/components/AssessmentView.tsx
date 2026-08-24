import { ASSESSMENT_CATEGORIES, SCORE_OPTIONS } from '../assessmentConfig'
import type { AnswersByQuestion, CategoryScores } from '../scorecard'
import { ScoreBar } from './ScoreBar'

type AssessmentViewProps = {
  answers: AnswersByQuestion
  categoryScores: CategoryScores
  completionPercentage: number
  isAssessmentComplete: boolean
  onScoreSelected: (questionId: string, score: number) => void
  onPrintBlankAssessment: () => void
  onReviewResults: () => void
}

export function AssessmentView({
  answers,
  categoryScores,
  completionPercentage,
  isAssessmentComplete,
  onScoreSelected,
  onPrintBlankAssessment,
  onReviewResults,
}: AssessmentViewProps) {
  return (
    <section className="content-section assessment-view">
      <div className="section-heading">
        <div><p className="eyebrow">Assessment</p><h2>Discuss each area together</h2></div>
        <span className="sample-label">Placeholder questions</span>
      </div>

      <div className="category-list">
        {ASSESSMENT_CATEGORIES.map((category) => (
          <article className="category-card" key={category.id}>
            <div className="category-header">
              <div>
                <span className="category-number">{category.code} · S.I.M.P.L.E.™</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <div className="category-score">
                <span>Category score</span>
                <strong>{categoryScores[category.id]}%</strong>
              </div>
            </div>
            <ScoreBar percentage={categoryScores[category.id]} label={`${category.name} score`} />

            <div className="question-list">
              {category.questions.map((question, questionIndex) => (
                <fieldset className="question-card" key={question.id}>
                  <legend><span>Question {questionIndex + 1}</span>{question.text}</legend>
                  <div className="score-options">
                    {SCORE_OPTIONS.map((scoreOption) => (
                      <button
                        type="button"
                        key={scoreOption.value}
                        aria-pressed={answers[question.id] === scoreOption.value}
                        className={answers[question.id] === scoreOption.value ? 'score-option selected' : 'score-option'}
                        onClick={() => onScoreSelected(question.id, scoreOption.value)}
                      >
                        <strong>{scoreOption.value}</strong>
                        <span>{scoreOption.label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="sticky-actions no-print">
        <span>
          <strong>{completionPercentage}% complete</strong>
          <small>{isAssessmentComplete ? 'Ready to review and save' : 'Continue answering the questions'}</small>
        </span>
        <div className="sticky-action-buttons">
          <button className="secondary-button" onClick={onPrintBlankAssessment}>Print paper assessment</button>
          <button className="primary-button" onClick={onReviewResults}>Review results</button>
        </div>
      </div>
    </section>
  )
}
