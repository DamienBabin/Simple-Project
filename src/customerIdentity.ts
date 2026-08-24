import type { SavedMeeting } from './scorecard'

export function normalizeCustomerId(customerId: string) {
  return customerId.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')
}

export function consolidateCustomerMeetings(meetings: SavedMeeting[]) {
  const consolidatedMeetings = new Map<string, SavedMeeting>()

  meetings.forEach((meeting) => {
    const normalizedCustomerId = meeting.clientId ? normalizeCustomerId(meeting.clientId) : ''
    const customerKey = normalizedCustomerId || `legacy-${meeting.clientName.trim().toLowerCase()}`
    const meetingKey = `${customerKey}-${meeting.meetingDate}`
    const normalizedMeeting = {
      ...meeting,
      clientId: normalizedCustomerId || undefined,
      id: normalizedCustomerId ? `${normalizedCustomerId.toLowerCase()}-${meeting.meetingDate}` : meeting.id,
    }
    const existingMeeting = consolidatedMeetings.get(meetingKey)

    if (!existingMeeting || normalizedMeeting.savedAt >= existingMeeting.savedAt) {
      consolidatedMeetings.set(meetingKey, normalizedMeeting)
    }
  })

  return [...consolidatedMeetings.values()]
}
