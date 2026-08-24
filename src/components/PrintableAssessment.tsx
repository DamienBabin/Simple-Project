import { ASSESSMENT_CATEGORIES, SCORE_OPTIONS } from '../assessmentConfig'
import { BRAND } from '../brandConfig'

type PrintableAssessmentProps = {
  clientId: string
  clientName: string
  formattedMeetingDate: string
}

export function PrintableAssessment({
  clientId,
  clientName,
  formattedMeetingDate,
}: PrintableAssessmentProps) {
  return (
    <section className="paper-assessment" aria-hidden="true">
      <header className="paper-assessment-header">
        <img src={BRAND.logoPath} alt="" />
        <div>
          <p>{BRAND.companyName}</p>
          <h1>{BRAND.productName}</h1>
          <span>Paper Assessment Worksheet</span>
        </div>
      </header>

      <div className="paper-client-fields">
        <p><strong>Customer ID</strong><span>{clientId}</span></p>
        <p><strong>Client name</strong><span>{clientName}</span></p>
        <p><strong>Meeting date</strong><span>{formattedMeetingDate}</span></p>
        <p><strong>Advisor / facilitator</strong><span /></p>
      </div>

      <div className="paper-score-legend">
        <strong>Score each statement:</strong>
        {SCORE_OPTIONS.map((scoreOption) => (
          <span key={scoreOption.value}>{scoreOption.value} — {scoreOption.label}</span>
        ))}
      </div>

      {ASSESSMENT_CATEGORIES.map((category) => (
        <section className="paper-category" key={category.id}>
          <header>
            <h2>{category.code} — {category.name}</h2>
            <p>{category.description}</p>
          </header>
          {category.questions.map((question, questionIndex) => (
            <div className="paper-question" key={question.id}>
              <p><strong>{questionIndex + 1}.</strong> {question.text}</p>
              <div className="paper-score-choices" aria-label="Score choices">
                {SCORE_OPTIONS.map((scoreOption) => (
                  <span key={scoreOption.value}><i />{scoreOption.value}</span>
                ))}
              </div>
            </div>
          ))}
          <p className="paper-category-total">Category total: __________ / 25</p>
        </section>
      ))}

      <footer className="paper-notes">
        <strong>Meeting notes / priorities</strong>
        <span /><span /><span />
      </footer>
    </section>
  )
}
