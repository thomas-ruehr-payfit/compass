// ─────────────────────────────────────────────────────────────────────────────
// WORKLOAD DATA
// Each block represents a project or task on the timeline.
//
// Fields:
//   id     – unique string
//   label  – display name
//   color  – hex color for the block
//   start  – "YYYY-MM-DD" start date (inclusive, must be a weekday)
//   end    – "YYYY-MM-DD" end date   (inclusive, must be a weekday)
//   row    – integer row index (0 = top row, 1 = second row, …)
//            use different rows only when two projects overlap in time
// ─────────────────────────────────────────────────────────────────────────────

export const blocks = [

  // ── Row 0: CDMS (this week) then Unity Patterns phases (next week → end S1) ─
  {
    id: 'cdms',
    label: 'CDMS',
    color: '#3b82f6',
    start: '2026-03-16', // Mon
    end:   '2026-03-20', // Fri
    row: 0,
  },
  {
    id: 'unity-1',
    label: 'Unity · Person + Entity display',
    color: '#6366f1',
    start: '2026-03-23', // Mon
    end:   '2026-04-10', // Fri
    row: 0,
  },
  {
    id: 'unity-2',
    label: 'Unity · Contextual help',
    color: '#7c3aed',
    start: '2026-04-13', // Mon
    end:   '2026-05-01', // Fri
    row: 0,
  },
  {
    id: 'unity-3',
    label: 'Unity · Loading pattern',
    color: '#8b5cf6',
    start: '2026-05-04', // Mon
    end:   '2026-05-22', // Fri
    row: 0,
  },
  {
    id: 'unity-4',
    label: 'Unity · Object creation',
    color: '#a78bfa',
    start: '2026-05-25', // Mon
    end:   '2026-06-12', // Fri
    row: 0,
  },
  {
    id: 'unity-5',
    label: 'Unity · First time usage',
    color: '#c084fc',
    start: '2026-06-15', // Mon
    end:   '2026-06-30', // Tue
    row: 0,
  },

  // ── Row 1: Back Office (end of Q1) then Orion (Q2) ─────────────────────────
  {
    id: 'backoffice',
    label: 'Back Office navigation',
    color: '#f59e0b',
    start: '2026-03-18', // Wed  — overlaps with CDMS above, needs separate row
    end:   '2026-03-31', // Tue
    row: 1,
  },
  {
    id: 'orion',
    label: 'Orion',
    color: '#10b981',
    start: '2026-04-01', // Wed
    end:   '2026-06-30', // Tue
    row: 1,
  },

];
