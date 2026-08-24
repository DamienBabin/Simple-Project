import type { SavedMeeting } from './scorecard'

const MEETING_STORAGE_KEY = 'client-scorecard-meetings'

export function loadSavedMeetings(): SavedMeeting[] {
  try {
    const storedMeetings = window.localStorage.getItem(MEETING_STORAGE_KEY)
    return storedMeetings ? JSON.parse(storedMeetings) : []
  } catch {
    return []
  }
}

export function storeSavedMeetings(meetings: SavedMeeting[]) {
  window.localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(meetings))
}
