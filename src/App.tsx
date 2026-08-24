import { useMemo, useState } from 'react'
import { ASSESSMENT_CATEGORIES } from './assessmentConfig'
import { BRAND } from './brandConfig'
import { AssessmentResults } from './components/AssessmentResults'
import { AssessmentView } from './components/AssessmentView'
import { MeetingHistoryView } from './components/MeetingHistoryView'
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

function createMeetingId(clientName: string, meetingDate: string) {
  const clientNameSlug = clientName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${clientNameSlug}-${meetingDate}`
}

function App() {
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
    const normalizedClientName = clientName.trim().toLowerCase()
    return savedMeetings
      .filter((meeting) => meeting.clientName.toLowerCase() === normalizedClientName)
      .sort((firstMeeting, secondMeeting) => secondMeeting.meetingDate.localeCompare(firstMeeting.meetingDate))
  }, [clientName, savedMeetings])
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

  function selectScore(questionId: string, score: number) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: score }))
    setNotice('')
  }

  function saveMeeting() {
    if (!clientName.trim() || !isAssessmentComplete) {
      setNotice('Enter a client name and answer every question before saving the meeting.')
      return
    }

    const meeting: SavedMeeting = {
      id: createMeetingId(clientName, meetingDate),
      clientName: clientName.trim(),
      meetingDate,
      savedAt: new Date().toISOString(),
      answers,
      categoryScores,
      overallScore,
      opportunities: opportunities.map((opportunity) => opportunity.name),
      wins,
    }
    const updatedMeetings = [
      ...savedMeetings.filter((savedMeeting) => savedMeeting.id !== meeting.id),
      meeting,
    ]
    setSavedMeetings(updatedMeetings)
    storeSavedMeetings(updatedMeetings)
    setNotice('Meeting saved on this device. It is now available in Meeting History.')
    setActiveView('results')
  }

  function startNewAssessment() {
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

  async function downloadAssessmentPdf() {
    const { downloadAssessmentPdf: createAssessmentPdf } = await import('./pdfReport')
    createAssessmentPdf({
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
          <span className="brand-mark">{BRAND.shortName}</span>
          <span><strong>{BRAND.shortName} Client Scorecard</strong><small>{BRAND.companyName}</small></span>
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
        <section className="hero-panel no-print">
          <div>
            <p className="eyebrow">Interactive client assessment</p>
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
            Client name
            <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Enter client or company name" />
          </label>
          <label>
            Meeting date
            <input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} />
          </label>
          <div className="completion-summary"><span>Assessment completion</span><strong>{completionPercentage}%</strong></div>
        </section>

        {notice && <p className="notice no-print" role="status">{notice}</p>}

        {activeView === 'assessment' && (
          <AssessmentView
            answers={answers}
            categoryScores={categoryScores}
            completionPercentage={completionPercentage}
            isAssessmentComplete={isAssessmentComplete}
            onScoreSelected={selectScore}
            onReviewResults={() => setActiveView('results')}
          />
        )}

        {activeView === 'results' && (
          <AssessmentResults
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
      </main>

      <footer className="app-footer no-print">
        <span>{BRAND.companyName}</span>
        <span>Local first version • Placeholder questions</span>
      </footer>
    </div>
  )
}

export default App
