import { ASSESSMENT_CATEGORIES, PROGRESS_THRESHOLDS } from './assessmentConfig'

export type AnswersByQuestion = Record<string, number>
export type CategoryScores = Record<string, number>

export type SavedMeeting = {
  id: string
  clientId?: string
  clientName: string
  meetingDate: string
  savedAt: string
  answers: AnswersByQuestion
  categoryScores: CategoryScores
  overallScore: number
  opportunities: string[]
  wins: string[]
}

export type ProgressStatus = 'risk' | 'warning' | 'success'

export type MeetingChange = {
  categoryId: string
  categoryName: string
  previousScore: number
  currentScore: number
  change: number
}

export function calculateCategoryPercentage(categoryId: string, answers: AnswersByQuestion) {
  const category = ASSESSMENT_CATEGORIES.find((item) => item.id === categoryId)
  if (!category) return 0

  const answeredQuestions = category.questions.filter((question) => answers[question.id] !== undefined)
  if (answeredQuestions.length === 0) return 0

  const pointsEarned = answeredQuestions.reduce((total, question) => total + answers[question.id], 0)
  return Math.round((pointsEarned / (category.questions.length * 5)) * 100)
}

export function calculateCategoryScores(answers: AnswersByQuestion): CategoryScores {
  return Object.fromEntries(
    ASSESSMENT_CATEGORIES.map((category) => [category.id, calculateCategoryPercentage(category.id, answers)]),
  )
}

export function calculateOverallPercentage(answers: AnswersByQuestion) {
  const questionCount = ASSESSMENT_CATEGORIES.reduce((total, category) => total + category.questions.length, 0)
  const pointsEarned = Object.values(answers).reduce((total, score) => total + score, 0)
  return Math.round((pointsEarned / (questionCount * 5)) * 100)
}

export function calculateCompletionPercentage(answers: AnswersByQuestion) {
  const questionCount = ASSESSMENT_CATEGORIES.reduce((total, category) => total + category.questions.length, 0)
  return Math.round((Object.keys(answers).length / questionCount) * 100)
}

export function determineProgressStatus(percentage: number): ProgressStatus {
  if (percentage >= PROGRESS_THRESHOLDS.successMinimum) return 'success'
  if (percentage >= PROGRESS_THRESHOLDS.warningMinimum) return 'warning'
  return 'risk'
}

export function identifyTopOpportunities(categoryScores: CategoryScores, answers: AnswersByQuestion) {
  return ASSESSMENT_CATEGORIES
    .map((category) => ({
      id: category.id,
      name: category.name,
      score: categoryScores[category.id] ?? 0,
      lowScoringQuestions: category.questions
        .filter((question) => answers[question.id] !== undefined && answers[question.id] <= 2)
        .map((question) => ({ text: question.text, score: answers[question.id] })),
    }))
    .sort((firstCategory, secondCategory) => firstCategory.score - secondCategory.score)
    .slice(0, 3)
}

export function calculateMeetingChanges(currentScores: CategoryScores, previousMeeting: SavedMeeting): MeetingChange[] {
  return ASSESSMENT_CATEGORIES.map((category) => {
    const previousScore = previousMeeting.categoryScores[category.id] ?? 0
    const currentScore = currentScores[category.id] ?? 0
    return { categoryId: category.id, categoryName: category.name, previousScore, currentScore, change: currentScore - previousScore }
  })
}

export function identifyUnlockedWins(
  currentScores: CategoryScores,
  currentOverall: number,
  previousMeeting: SavedMeeting | undefined,
  clientMeetingHistory: SavedMeeting[],
) {
  const wins: string[] = []

  ASSESSMENT_CATEGORIES.forEach((category) => {
    const currentScore = currentScores[category.id] ?? 0
    const previousScore = previousMeeting?.categoryScores[category.id]
    if (previousScore !== undefined && currentScore - previousScore >= 10) {
      wins.push(`${category.name} improved by ${currentScore - previousScore} percentage points.`)
    }
    if (previousScore !== undefined && previousScore < 75 && currentScore >= 75) {
      wins.push(`${category.name} entered the strong performance range.`)
    }
    if (previousScore !== undefined && previousScore < 50 && currentScore >= 50) {
      wins.push(`${category.name} moved out of the immediate-attention range.`)
    }
    if (currentScore >= 80) wins.push(`${category.name} achieved a score of 80% or higher.`)
  })

  if (previousMeeting && currentOverall - previousMeeting.overallScore >= 10) {
    wins.push(`Overall performance improved by ${currentOverall - previousMeeting.overallScore} percentage points.`)
  }
  if (!previousMeeting && currentOverall >= 75) wins.push('The initial assessment reached the strong performance range.')

  const previousHighestScore = Math.max(...clientMeetingHistory.map((meeting) => meeting.overallScore), -1)
  if (clientMeetingHistory.length > 0 && currentOverall > previousHighestScore) {
    wins.push(`This is the client's highest overall score so far at ${currentOverall}%.`)
  }

  return [...new Set(wins)]
}
