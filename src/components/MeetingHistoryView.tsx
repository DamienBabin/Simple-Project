import { determineProgressStatus, type SavedMeeting } from '../scorecard'

type MeetingHistoryViewProps = {
  savedMeetings: SavedMeeting[]
  formatMeetingDate: (meetingDate: string) => string
  onNewAssessment: () => void
  onOpenMeeting: (meeting: SavedMeeting) => void
}

export function MeetingHistoryView({ savedMeetings, formatMeetingDate, onNewAssessment, onOpenMeeting }: MeetingHistoryViewProps) {
  const meetingsNewestFirst = [...savedMeetings].sort((firstMeeting, secondMeeting) =>
    secondMeeting.meetingDate.localeCompare(firstMeeting.meetingDate),
  )

  return (
    <section className="content-section history-view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Saved locally</p>
          <h2>Meeting History</h2>
          <p>Assessments are stored only in this browser for the first version.</p>
        </div>
        <button className="primary-button" onClick={onNewAssessment}>New assessment</button>
      </div>

      {meetingsNewestFirst.length > 0 ? (
        <div className="history-list">
          {meetingsNewestFirst.map((meeting) => (
            <article className="history-card" key={meeting.id}>
              <div>
                <span>{formatMeetingDate(meeting.meetingDate)}</span>
                <h3>{meeting.clientName}</h3>
                <p><strong>Customer ID:</strong> {meeting.clientId || 'Legacy record'}</p>
                <p>{meeting.opportunities.join(' • ')}</p>
              </div>
              <div className="history-actions">
                <div className={`history-score ${determineProgressStatus(meeting.overallScore)}`}>
                  <strong>{meeting.overallScore}%</strong><span>Overall</span>
                </div>
                <button className="secondary-button" onClick={() => onOpenMeeting(meeting)}>Open results</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-history">
          <strong>No meetings saved yet</strong>
          <p>Complete an assessment and save it to start tracking client progress.</p>
        </div>
      )}
    </section>
  )
}
