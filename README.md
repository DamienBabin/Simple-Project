# APG S.I.M.P.L.E.™ Scorecard

A smart-board-friendly assessment for conducting client meetings, calculating
scores live, saving meeting history, and presenting professional results.

Branding is configured in `src/brandConfig.ts` for APG (Asset Preservation
Group). The official logo is stored at `public/apg-logo.png` and is used in the
application header, results report, print layout, and downloaded PDF.

## Technology

- **React** updates the interface immediately when an answer changes.
- **TypeScript** documents the shape of questions, answers, and meeting records.
- **Vite** provides a small, fast development and production setup.
- **Browser local storage** saves the first-version meeting history without a
  backend or additional dependency.

Customer IDs are the primary key for connecting repeat assessments. This keeps
meeting comparisons reliable even if a company name is entered differently at
a later meeting. Older saved records without an ID remain readable and use the
client name as a compatibility fallback. Spaces and punctuation in an ID are
normalized automatically, duplicate copies for the same customer and date are
consolidated, and the newest saved copy is retained. Entering an existing ID
also restores the latest client name and links the prior assessment for an
automatic comparison.

Use Node.js 22 LTS. The `.nvmrc` file records the recommended version.

## Run locally

```powershell
npm install
npm run dev
```

## Verify changes

```powershell
npm run lint
npm run build
```

## Where to make common changes

### Categories, questions, answer labels, and thresholds

Edit `src/assessmentConfig.ts`. This is the single source of truth for:

- Category names and descriptions
- The five questions in each category
- The 1–5 answer labels
- Red, yellow, and green percentage thresholds

The current questions are explicitly marked as sample data.

### Scoring and business rules

Edit `src/scorecard.ts`. It contains deterministic functions for:

- Category percentages
- Overall percentage
- Completion percentage
- Progress status colors
- Top opportunities and low-scoring questions
- Meeting-to-meeting changes
- Wins Unlocked

Each category percentage uses:

`points earned / maximum category points × 100`

With five questions worth five points each, the maximum is 25 points.

### Meeting history

`src/meetingStorage.ts` reads and writes completed meeting records in the
current browser's local storage. `src/App.tsx` creates each complete meeting
record and passes it to the storage functions.

The storage functions are intentionally separate. A future database service can
replace this file without rewriting the scoring or visual components.

### Interface components

- `src/App.tsx` manages the active assessment, calculated results, and workflow.
- `src/components/AssessmentView.tsx` displays categories and scoring buttons.
- `src/components/AssessmentResults.tsx` displays the client-ready summary.
- `src/components/MeetingHistoryView.tsx` displays saved meetings.
- `src/components/ScoreBar.tsx` displays reusable score progress bars.
- `src/App.css` contains component and print styles.
- `src/index.css` contains brand colors and global accessibility styles.

## Win rules

The first version unlocks a win when:

- A category improves by at least 10 percentage points.
- A category enters the green range.
- A category leaves the red range.
- A category reaches 80% or higher.
- The overall score improves by at least 10 percentage points.
- The client reaches their highest overall score so far.

All win rules are located in `identifyUnlockedWins()` in `src/scorecard.ts`.

## Printing and PDF

The assessment screen includes a **Print paper assessment** button that creates
a clean, letter-size worksheet with the client fields, scoring legend, all 30
questions, 1–5 choices, category totals, and meeting-note lines. It can be used
as a blank form or can include client details entered before printing.

The results screen has separate Print Results and Download Assessment PDF
buttons. Results printing uses the browser and a dedicated print stylesheet. PDF
download uses `src/pdfReport.ts` and `jsPDF` to generate a branded, text-based
report directly. The PDF includes the overall score, category progress,
opportunities, wins, and meeting comparison.

## Future database and hosting

For multi-device access, replace the functions in `src/meetingStorage.ts` with
API calls to a database-backed service. The `SavedMeeting` type in
`src/scorecard.ts` documents the record that needs to be stored.

Before public hosting, add the final company branding, replace the sample
questions, choose an authentication approach if records are private, and move
meeting history out of browser local storage.
