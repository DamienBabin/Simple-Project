import { useEffect, useMemo, useState } from 'react'
import { ASSESSMENT_CATEGORIES } from './assessmentConfig'
import { BRAND } from './brandConfig'
import { consolidateCustomerMeetings, normalizeCustomerId } from './customerIdentity'
import { AssessmentResults } from './components/AssessmentResults'
import { AssessmentView } from './components/AssessmentView'
import { MeetingHistoryView } from './components/MeetingHistoryView'
import { PrintableAssessment } from './components/PrintableAssessment'
import { ScoreBar } from './components/ScoreBar'
import { loadSavedMeetings, storeSavedMeetings } from './meetingStorage'
import {
  calculateCategoryScores,
  calculateCompletionPercentage,
  calculateMeetingChanges,
  calculateOverallPercentage,
  identifyTopOpportunities,
  identifyUnlockedWins,
  type AnswersByQuestion,
  type SavedMeeting,
} from './scorecard'
import './App.css'

type AppView = 'assessment' | 'results' | 'history'

function todayAsInputDate() {
  const today = new Date()
  const timezoneOffset = today.getTimezoneOffset() * 60_000
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function formatMeetingDate(meetingDate: string) {
  return new Date(`${meetingDate}T12:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function createMeetingId(clientId: string, meetingDate: string) {
  return `${normalizeCustomerId(clientId).toLowerCase()}-${meetingDate}`
}

function App() {
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [meetingDate, setMeetingDate] = useState(todayAsInputDate())
  const [answers, setAnswers] = useState<AnswersByQuestion>({})
  const [savedMeetings, setSavedMeetings] = useState<SavedMeeting[]>(loadSavedMeetings)
  const [activeView, setActiveView] = useState<AppView>('assessment')
  const [notice, setNotice] = useState('')

  const categoryScores = useMemo(() => calculateCategoryScores(answers), [answers])
  const overallScore = useMemo(() => calculateOverallPercentage(answers), [answers])
  const completionPercentage = useMemo(() => calculateCompletionPercentage(answers), [answers])
  const clientMeetingHistory = useMemo(() => {
    const normalizedClientId = normalizeCustomerId(clientId)
    const normalizedClientName = clientName.trim().toLowerCase()
    return savedMeetings
      .filter((meeting) => {
        if (meeting.clientId && normalizedClientId) return normalizeCustomerId(meeting.clientId) === normalizedClientId
        if (meeting.clientId || normalizedClientId) return false
        return meeting.clientName.toLowerCase() === normalizedClientName
      })
      .sort((firstMeeting, secondMeeting) => secondMeeting.meetingDate.localeCompare(firstMeeting.meetingDate))
  }, [clientId, clientName, savedMeetings])
  const previousMeeting = useMemo(
    () => clientMeetingHistory.find((meeting) => meeting.meetingDate < meetingDate),
    [clientMeetingHistory, meetingDate],
  )
  const opportunities = useMemo(
    () => identifyTopOpportunities(categoryScores, answers),
    [categoryScores, answers],
  )
  const wins = useMemo(
    () => identifyUnlockedWins(categoryScores, overallScore, previousMeeting, clientMeetingHistory),
    [categoryScores, overallScore, previousMeeting, clientMeetingHistory],
  )
  const meetingChanges = useMemo(
    () => previousMeeting ? calculateMeetingChanges(categoryScores, previousMeeting) : [],
    [categoryScores, previousMeeting],
  )

  const totalQuestions = ASSESSMENT_CATEGORIES.reduce(
    (questionTotal, category) => questionTotal + category.questions.length,
    0,
  )
  const answeredQuestionCount = Object.keys(answers).length
  const isAssessmentComplete = answeredQuestionCount === totalQuestions
  const overallChange = previousMeeting ? overallScore - previousMeeting.overallScore : undefined

  useEffect(() => {
    if (!clientId.trim() || clientName.trim() || clientMeetingHistory.length === 0) return
    setClientName(clientMeetingHistory[0].clientName)
  }, [clientId, clientName, clientMeetingHistory])

  function selectScore(questionId: string, score: number) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: score }))
    setNotice('')
  }

  function saveMeeting() {
    if (!clientId.trim() || !clientName.trim() || !isAssessmentComplete) {
      setNotice('Enter a Customer ID and client name, then answer every question before saving the meeting.')
      return
    }

    const meeting: SavedMeeting = {
      id: createMeetingId(clientId, meetingDate),
      clientId: normalizeCustomerId(clientId),
      clientName: clientName.trim(),
      meetingDate,
      savedAt: new Date().toISOString(),
      answers,
      categoryScores,
      overallScore,
      opportunities: opportunities.map((opportunity) => opportunity.name),
      wins,
    }
    const updatedMeetings = consolidateCustomerMeetings([
      ...savedMeetings.filter((savedMeeting) => savedMeeting.id !== meeting.id),
      meeting,
    ])
    setSavedMeetings(updatedMeetings)
    storeSavedMeetings(updatedMeetings)
    setNotice('Meeting saved on this device. It is now available in Meeting History.')
    setActiveView('results')
  }

  function startNewAssessment() {
    setClientId('')
    setClientName('')
    setMeetingDate(todayAsInputDate())
    setAnswers({})
    setNotice('New assessment started.')
    setActiveView('assessment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openPrintDialog() {
    setActiveView('results')
    window.setTimeout(() => window.print(), 100)
  }

  function printBlankAssessment() {
    document.body.classList.add('printing-paper-assessment')
    window.addEventListener(
      'afterprint',
      () => document.body.classList.remove('printing-paper-assessment'),
      { once: true },
    )
    window.setTimeout(() => window.print(), 100)
  }

  async function downloadAssessmentPdf() {
    const { downloadAssessmentPdf: createAssessmentPdf } = await import('./pdfReport')
    await createAssessmentPdf({
      clientId: normalizeCustomerId(clientId),
      clientName,
      formattedMeetingDate: formatMeetingDate(meetingDate),
      meetingDate,
      overallScore,
      categoryScores,
      opportunities,
      wins,
      previousMeetingDate: previousMeeting ? formatMeetingDate(previousMeeting.meetingDate) : undefined,
      overallChange,
      meetingChanges,
    })
  }

  function openSavedMeeting(meeting: SavedMeeting) {
    setClientId(meeting.clientId ?? '')
    setClientName(meeting.clientName)
    setMeetingDate(meeting.meetingDate)
    setAnswers(meeting.answers)
    setNotice(`Loaded ${meeting.clientName}'s assessment from ${formatMeetingDate(meeting.meetingDate)}.`)
    setActiveView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="app-header no-print">
        <a className="brand" href="#top" aria-label={`${BRAND.companyName} scorecard home`}>
          <img className="brand-logo" src={BRAND.logoPath} alt="" />
          <span><strong>{BRAND.shortName} {BRAND.productName}</strong><small>{BRAND.companyName}</small></span>
        </a>
        <nav aria-label="Primary navigation">
          {(['assessment', 'results', 'history'] as const).map((view) => (
            <button
              aria-pressed={activeView === view}
              className={activeView === view ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveView(view)}
              key={view}
            >
              {view[0].toUpperCase() + view.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main id="top">
        {activeView === 'assessment' && (
          <>
            <section className="hero-panel no-print">
              <div>
                <p className="eyebrow">{BRAND.productName}</p>
                <h1>A clear view of where your client stands.</h1>
                <p className="hero-copy">Work through each area together, see progress immediately, and agree on the priorities that matter most.</p>
              </div>
              <div className="overall-card">
                <span>Overall client score</span>
                <strong>{overallScore}%</strong>
                <ScoreBar percentage={overallScore} label="Overall score" />
                <small>{answeredQuestionCount} of {totalQuestions} questions answered</small>
              </div>
            </section>

            <section className="client-panel no-print" aria-label="Client details">
              <label>
                Customer ID
                <input value={clientId} onChange={(event) => setClientId(event.target.value)} placeholder="Example: APG-1001" autoComplete="off" />
                <small className={clientMeetingHistory.length > 0 ? 'linked-history found' : 'linked-history'}>
                  {clientMeetingHistory.length > 0
                    ? `${clientMeetingHistory.length} saved assessment${clientMeetingHistory.length === 1 ? '' : 's'} linked automatically`
                    : 'Matching IDs will link previous assessments automatically'}
                </small>
              </label>
              <label>
                Client name
                <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Enter client or company name" />
              </label>
              <label>
                Meeting date
                <input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} />
              </label>
              <div className="completion-summary"><span>Assessment completion</span><strong>{completionPercentage}%</strong></div>
            </section>
          </>
        )}

        {notice && <p className="notice no-print" role="status">{notice}</p>}

        {activeView === 'assessment' && (
          <AssessmentView
            answers={answers}
            categoryScores={categoryScores}
            completionPercentage={completionPercentage}
            isAssessmentComplete={isAssessmentComplete}
            onScoreSelected={selectScore}
            onPrintBlankAssessment={printBlankAssessment}
            onReviewResults={() => setActiveView('results')}
          />
        )}

        {activeView === 'results' && (
          <AssessmentResults
            clientId={clientId}
            clientName={clientName}
            meetingDate={meetingDate}
            overallScore={overallScore}
            categoryScores={categoryScores}
            opportunities={opportunities}
            wins={wins}
            previousMeeting={previousMeeting}
            meetingChanges={meetingChanges}
            overallChange={overallChange}
            isAssessmentComplete={isAssessmentComplete}
            totalQuestions={totalQuestions}
            formatMeetingDate={formatMeetingDate}
            onEditAssessment={() => setActiveView('assessment')}
            onPrint={openPrintDialog}
            onDownloadPdf={downloadAssessmentPdf}
            onSaveMeeting={saveMeeting}
            onNewAssessment={startNewAssessment}
          />
        )}

        {activeView === 'history' && (
          <MeetingHistoryView
            savedMeetings={savedMeetings}
            formatMeetingDate={formatMeetingDate}
            onNewAssessment={startNewAssessment}
            onOpenMeeting={openSavedMeeting}
          />
        )}

        <PrintableAssessment
          clientId={normalizeCustomerId(clientId)}
          clientName={clientName}
          formattedMeetingDate={formatMeetingDate(meetingDate)}
        />
      </main>

      <footer className="app-footer no-print">
        <span>{BRAND.companyName}</span>
        <span>Local first version • Placeholder questions</span>
      </footer>
    </div>
  )
}

export default App
