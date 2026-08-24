import type { SavedMeeting } from './scorecard'
import { consolidateCustomerMeetings } from './customerIdentity'

const MEETING_STORAGE_KEY = 'client-scorecard-meetings'

export function loadSavedMeetings(): SavedMeeting[] {
  try {
    const storedMeetings = window.localStorage.getItem(MEETING_STORAGE_KEY)
    if (!storedMeetings) return []

    const consolidatedMeetings = consolidateCustomerMeetings(JSON.parse(storedMeetings))
    window.localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(consolidatedMeetings))
    return consolidatedMeetings
  } catch {
    return []
  }
}

export function storeSavedMeetings(meetings: SavedMeeting[]) {
  window.localStorage.setItem(
    MEETING_STORAGE_KEY,
    JSON.stringify(consolidateCustomerMeetings(meetings)),
  )
}
