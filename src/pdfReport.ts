import { jsPDF } from 'jspdf'
import { ASSESSMENT_CATEGORIES, PROGRESS_THRESHOLDS } from './assessmentConfig'
import { BRAND } from './brandConfig'
import type { CategoryScores, MeetingChange } from './scorecard'

type PdfOpportunity = {
  name: string
  score: number
  lowScoringQuestions: { text: string; score: number }[]
}

export type PdfReportData = {
  clientId: string
  clientName: string
  formattedMeetingDate: string
  meetingDate: string
  overallScore: number
  categoryScores: CategoryScores
  opportunities: PdfOpportunity[]
  wins: string[]
  previousMeetingDate?: string
  overallChange?: number
  meetingChanges: MeetingChange[]
}

const REPORT_COLORS = {
  navy: [18, 59, 93] as const,
  blue: [23, 90, 150] as const,
  lightBlue: [232, 242, 248] as const,
  text: [29, 44, 54] as const,
  muted: [83, 103, 115] as const,
  border: [204, 216, 223] as const,
  success: [36, 112, 74] as const,
  warning: [211, 155, 22] as const,
  risk: [182, 64, 64] as const,
}

type ReportColor = readonly [number, number, number]

function scoreColor(score: number): ReportColor {
  if (score >= PROGRESS_THRESHOLDS.successMinimum) return REPORT_COLORS.success
  if (score >= PROGRESS_THRESHOLDS.warningMinimum) return REPORT_COLORS.warning
  return REPORT_COLORS.risk
}

function safePdfFilename(clientName: string, meetingDate: string) {
  const safeClientName = clientName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'Client'
  return `${safeClientName}-APG-SIMPLE-Scorecard-${meetingDate}.pdf`
}

async function loadBrandLogoDataUrl() {
  try {
    const logoResponse = await fetch(BRAND.logoPath)
    const logoBlob = await logoResponse.blob()
    return await new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => resolve(String(fileReader.result))
      fileReader.onerror = () => reject(fileReader.error)
      fileReader.readAsDataURL(logoBlob)
    })
  } catch {
    return undefined
  }
}

export async function downloadAssessmentPdf(reportData: PdfReportData) {
  const pdfDocument = new jsPDF({ unit: 'mm', format: 'letter' })
  const brandLogoDataUrl = await loadBrandLogoDataUrl()
  const pageWidth = pdfDocument.internal.pageSize.getWidth()
  const pageHeight = pdfDocument.internal.pageSize.getHeight()
  const leftMargin = 16
  const contentWidth = pageWidth - leftMargin * 2
  const bottomMargin = 18
  let verticalPosition = 0

  function addPageIfNeeded(requiredHeight: number) {
    if (verticalPosition + requiredHeight <= pageHeight - bottomMargin) return
    pdfDocument.addPage()
    verticalPosition = 18
  }

  function addSectionHeading(heading: string) {
    addPageIfNeeded(14)
    pdfDocument.setTextColor(...REPORT_COLORS.navy)
    pdfDocument.setFont('helvetica', 'bold')
    pdfDocument.setFontSize(13)
    pdfDocument.text(heading, leftMargin, verticalPosition)
    verticalPosition += 8
  }

  function addWrappedText(text: string, indent = 0) {
    pdfDocument.setFont('helvetica', 'normal')
    pdfDocument.setFontSize(9)
    pdfDocument.setTextColor(...REPORT_COLORS.text)
    const lines = pdfDocument.splitTextToSize(text, contentWidth - indent)
    addPageIfNeeded(lines.length * 4.6)
    pdfDocument.text(lines, leftMargin + indent, verticalPosition)
    verticalPosition += lines.length * 4.6
  }

  pdfDocument.setFillColor(...REPORT_COLORS.navy)
  pdfDocument.rect(0, 0, pageWidth, 48, 'F')
  if (brandLogoDataUrl) {
    pdfDocument.addImage(brandLogoDataUrl, 'PNG', leftMargin, 9, 25, 25)
  }
  pdfDocument.setTextColor(255, 255, 255)
  pdfDocument.setFont('helvetica', 'bold')
  pdfDocument.setFontSize(20)
  pdfDocument.text(`${BRAND.shortName} ${BRAND.productName}`, leftMargin + 31, 18)
  pdfDocument.setFont('helvetica', 'normal')
  pdfDocument.setFontSize(10)
  pdfDocument.text(reportData.clientName || 'Client name not entered', leftMargin + 31, 28)
  pdfDocument.text(`Customer ID: ${reportData.clientId || 'Not entered'}`, leftMargin + 31, 34)
  pdfDocument.text(reportData.formattedMeetingDate, leftMargin + 31, 40)
  pdfDocument.setFont('helvetica', 'bold')
  pdfDocument.setFontSize(25)
  pdfDocument.text(`${reportData.overallScore}%`, pageWidth - leftMargin, 25, { align: 'right' })
  pdfDocument.setFont('helvetica', 'normal')
  pdfDocument.setFontSize(9)
  pdfDocument.text('OVERALL SCORE', pageWidth - leftMargin, 34, { align: 'right' })
  verticalPosition = 60

  addSectionHeading('Performance by category')
  ASSESSMENT_CATEGORIES.forEach((category) => {
    addPageIfNeeded(13)
    const categoryScore = reportData.categoryScores[category.id] ?? 0
    const barWidth = 92
    pdfDocument.setFont('helvetica', 'bold')
    pdfDocument.setFontSize(10)
    pdfDocument.setTextColor(...REPORT_COLORS.text)
    pdfDocument.text(category.name, leftMargin, verticalPosition)
    pdfDocument.setFillColor(226, 232, 236)
    pdfDocument.roundedRect(leftMargin + 55, verticalPosition - 3.5, barWidth, 4, 2, 2, 'F')
    const categoryScoreColor = scoreColor(categoryScore)
    pdfDocument.setFillColor(categoryScoreColor[0], categoryScoreColor[1], categoryScoreColor[2])
    if (categoryScore > 0) {
      pdfDocument.roundedRect(leftMargin + 55, verticalPosition - 3.5, barWidth * categoryScore / 100, 4, 2, 2, 'F')
    }
    pdfDocument.text(`${categoryScore}%`, pageWidth - leftMargin, verticalPosition, { align: 'right' })
    verticalPosition += 10
  })

  verticalPosition += 3
  addSectionHeading('Top Opportunities')
  reportData.opportunities.forEach((opportunity, opportunityIndex) => {
    addPageIfNeeded(10)
    pdfDocument.setFont('helvetica', 'bold')
    pdfDocument.setFontSize(10)
    pdfDocument.setTextColor(...REPORT_COLORS.text)
    pdfDocument.text(`${opportunityIndex + 1}. ${opportunity.name}`, leftMargin, verticalPosition)
    const opportunityScoreColor = scoreColor(opportunity.score)
    pdfDocument.setTextColor(opportunityScoreColor[0], opportunityScoreColor[1], opportunityScoreColor[2])
    pdfDocument.text(`${opportunity.score}%`, pageWidth - leftMargin, verticalPosition, { align: 'right' })
    verticalPosition += 5
    opportunity.lowScoringQuestions.forEach((question) => {
      addWrappedText(`• ${question.text} (${question.score}/5)`, 4)
    })
    verticalPosition += 2
  })

  addSectionHeading('Wins Unlocked')
  if (reportData.wins.length > 0) {
    reportData.wins.forEach((win) => addWrappedText(`• ${win}`, 2))
  } else {
    addWrappedText('No improvement wins have been unlocked yet. Compare this assessment with a future meeting to track progress.')
  }
  verticalPosition += 4

  addSectionHeading('Meeting Comparison')
  if (reportData.previousMeetingDate && reportData.overallChange !== undefined) {
    pdfDocument.setFillColor(...REPORT_COLORS.lightBlue)
    pdfDocument.rect(leftMargin, verticalPosition - 4, contentWidth, 11, 'F')
    pdfDocument.setFont('helvetica', 'bold')
    pdfDocument.setFontSize(10)
    pdfDocument.setTextColor(...REPORT_COLORS.navy)
    const formattedOverallChange = `${reportData.overallChange > 0 ? '+' : ''}${reportData.overallChange}%`
    pdfDocument.text(`Overall change since ${reportData.previousMeetingDate}`, leftMargin + 3, verticalPosition + 2)
    pdfDocument.text(formattedOverallChange, pageWidth - leftMargin - 3, verticalPosition + 2, { align: 'right' })
    verticalPosition += 14

    reportData.meetingChanges.forEach((meetingChange) => {
      addPageIfNeeded(8)
      pdfDocument.setFont('helvetica', 'bold')
      pdfDocument.setFontSize(9)
      pdfDocument.setTextColor(...REPORT_COLORS.text)
      pdfDocument.text(meetingChange.categoryName, leftMargin, verticalPosition)
      pdfDocument.setFont('helvetica', 'normal')
      pdfDocument.text(`Previous ${meetingChange.previousScore}%`, leftMargin + 65, verticalPosition)
      pdfDocument.text(`Current ${meetingChange.currentScore}%`, leftMargin + 105, verticalPosition)
      const meetingChangeColor = meetingChange.change >= 0 ? REPORT_COLORS.success : REPORT_COLORS.risk
      pdfDocument.setTextColor(meetingChangeColor[0], meetingChangeColor[1], meetingChangeColor[2])
      pdfDocument.text(`${meetingChange.change > 0 ? '+' : ''}${meetingChange.change}%`, pageWidth - leftMargin, verticalPosition, { align: 'right' })
      verticalPosition += 7
    })
  } else {
    addWrappedText('This is the first saved assessment for this client. Future assessments will include meeting-to-meeting comparisons.')
  }

  const pageCount = pdfDocument.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdfDocument.setPage(pageNumber)
    pdfDocument.setDrawColor(...REPORT_COLORS.border)
    pdfDocument.line(leftMargin, pageHeight - 12, pageWidth - leftMargin, pageHeight - 12)
    pdfDocument.setFont('helvetica', 'normal')
    pdfDocument.setFontSize(8)
    pdfDocument.setTextColor(...REPORT_COLORS.muted)
    pdfDocument.text(BRAND.companyName, leftMargin, pageHeight - 7)
    pdfDocument.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - leftMargin, pageHeight - 7, { align: 'right' })
  }

  pdfDocument.save(safePdfFilename(reportData.clientName, reportData.meetingDate))
}
