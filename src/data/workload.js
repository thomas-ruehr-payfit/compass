// ─────────────────────────────────────────────────────────────────────────────
// WORKLOAD DATA
// Each block represents a task on the timeline, color-coded by objective.
//
// Row assignment (to avoid horizontal overlaps):
//   Row 0 — O6 JetLang (Jan 6 → Jan 27), then O1 Unity patterns (Mar 16 → Jun 12)
//   Row 1 — O7 Compliance (Jan 27 → Mar 13), then O2 BackOffice (Mar 16 → Apr 3),
//            then O3 Orion (May 4 → Jul 24), then O5 Processor (Jul 27 → Jul 31)
//   Row 2 — O8 CDMS (Mar 12 → Mar 20), then O2 BackOffice Prototype (Mar 30 → Apr 10),
//            then O4 Access & Permissions (May 18 → Jul 31)
//   ── separator ──
//   Row 4 — O9 Personal stream (Mar 16 → Jul 31)
// ─────────────────────────────────────────────────────────────────────────────

// Periods shown as a shaded "out of office" band on the timeline
export const offPeriods = [
  { id: 'ooo-apr', label: 'Out of office', start: '2026-04-13', end: '2026-04-17' },
];

export const blocks = [

  // ── Row 0 · O6 JetLang unit testing (past), then O1 Unity patterns ─────────
  {
    id: 'jetlang-unit-testing',
    label: 'JetLang · Unit testing',
    color: '#06b6d4',
    start: '2026-01-06',
    end:   '2026-01-27',
    row: 0,
  },

  // ── Row 0 · O1 Unity patterns ─────────────────────────────────────────────
  {
    id: 'unity-setup',
    label: 'Unity · Structure workstream',
    color: '#6366f1',
    start: '2026-03-16',
    end:   '2026-03-20',
    row: 0,
  },
  {
    id: 'unity-person-entity',
    label: 'Unity · Person + Entity Display',
    color: '#6366f1',
    start: '2026-03-23',
    end:   '2026-03-27',
    row: 0,
  },
  {
    id: 'unity-contextual-help',
    label: 'Unity · Contextual Help',
    color: '#6366f1',
    start: '2026-03-30',
    end:   '2026-04-17',
    row: 0,
  },
  {
    id: 'unity-loading',
    label: 'Unity · Loading Pattern',
    color: '#6366f1',
    start: '2026-04-20',
    end:   '2026-05-01',
    row: 0,
  },
  {
    id: 'unity-object-creation',
    label: 'Unity · Object Creation',
    color: '#6366f1',
    start: '2026-05-04',
    end:   '2026-05-15',
    row: 0,
  },
  {
    id: 'unity-first-time',
    label: 'Unity · First Time Usage',
    color: '#6366f1',
    start: '2026-05-18',
    end:   '2026-05-29',
    row: 0,
  },
  {
    id: 'unity-finalize',
    label: 'Unity · Document & Finalize',
    color: '#6366f1',
    start: '2026-06-01',
    end:   '2026-06-12',
    row: 0,
  },

  // ── Row 1 · O7 Compliance testing (past), then O2 BackOffice ─────────────
  {
    id: 'compliance-testing',
    label: 'Compliance · Testing tool',
    color: '#f97316',
    start: '2026-01-27',
    end:   '2026-03-13',
    row: 1,
  },

  // ── Row 1 · O2 BackOffice Navigation (finalized prototype by Apr 10) ────────
  {
    id: 'backoffice-audit',
    label: 'BackOffice · Audit & Interviews',
    color: '#f59e0b',
    start: '2026-03-16',
    end:   '2026-03-27',
    row: 1,
  },
  {
    id: 'backoffice-principles',
    label: 'BackOffice · Principles & Framing',
    color: '#f59e0b',
    start: '2026-03-30',
    end:   '2026-04-03',
    row: 1,
  },
  {
    id: 'backoffice-prototype',
    label: 'BackOffice · Prototype & Testing',
    color: '#f59e0b',
    start: '2026-03-30',
    end:   '2026-04-10',
    row: 2,
  },

  // ── Row 1 · O3 Orion (picks up after BackOffice ends) ─────────────────────
  {
    id: 'orion-onboarding',
    label: 'Orion · Onboarding',
    color: '#10b981',
    start: '2026-05-04',
    end:   '2026-05-08',
    row: 1,
  },
  {
    id: 'orion-discovery',
    label: 'Orion · Discovery & JTBD',
    color: '#10b981',
    start: '2026-05-11',
    end:   '2026-05-15',
    row: 1,
  },
  {
    id: 'orion-solution-frame',
    label: 'Orion · Solution directions',
    color: '#10b981',
    start: '2026-05-18',
    end:   '2026-05-22',
    row: 1,
  },
  {
    id: 'orion-exploration',
    label: 'Orion · Exploration',
    color: '#10b981',
    start: '2026-05-25',
    end:   '2026-06-05',
    row: 1,
  },
  {
    id: 'orion-rampup',
    label: 'Orion · Ramp up',
    color: '#10b981',
    start: '2026-06-08',
    end:   '2026-06-12',
    row: 1,
  },
  {
    id: 'orion-framing',
    label: 'Orion · Framing & direction',
    color: '#10b981',
    start: '2026-06-15',
    end:   '2026-06-26',
    row: 1,
  },
  {
    id: 'orion-cs',
    label: 'Orion · CS Agents interface',
    color: '#10b981',
    start: '2026-06-29',
    end:   '2026-07-10',
    row: 1,
  },
  {
    id: 'orion-deliverables',
    label: 'Orion · Design deliverables',
    color: '#10b981',
    start: '2026-07-13',
    end:   '2026-07-24',
    row: 1,
  },

  // ── Row 1 · O5 Processor to Ant (after Orion ends) ────────────────────────
  {
    id: 'processor-ant',
    label: 'Processor · Reassess migration',
    color: '#64748b',
    start: '2026-07-27',
    end:   '2026-07-31',
    row: 1,
  },

  // ── Row 2 · O8 CDMS (past) ────────────────────────────────────────────────
  {
    id: 'cdms',
    label: 'CDMS · Dashboard JTBD',
    color: '#e11d48',
    start: '2026-03-12',
    end:   '2026-03-20',
    row: 2,
  },

  // ── Row 2 · O4 Access & Permissions ───────────────────────────────────────
  {
    id: 'ap-kickoff',
    label: 'Access & Permissions · Kickoff',
    color: '#3b82f6',
    start: '2026-05-18',
    end:   '2026-05-22',
    row: 2,
  },
  // (gap May 25 – Jun 6 — no A&P tasks)
  {
    id: 'ap-start',
    label: 'Access & Permissions · Structured start',
    color: '#3b82f6',
    start: '2026-06-08',
    end:   '2026-06-12',
    row: 2,
  },
  {
    id: 'ap-scope',
    label: 'Access & Permissions · Problem & scope',
    color: '#3b82f6',
    start: '2026-06-15',
    end:   '2026-06-19',
    row: 2,
  },
  {
    id: 'ap-solution',
    label: 'Access & Permissions · Solution',
    color: '#3b82f6',
    start: '2026-06-22',
    end:   '2026-07-03',
    row: 2,
  },
  {
    id: 'ap-impl',
    label: 'Access & Permissions · Impl-ready designs',
    color: '#3b82f6',
    start: '2026-07-06',
    end:   '2026-07-17',
    row: 2,
  },
  {
    id: 'ap-close',
    label: 'Access & Permissions · Finalize & close',
    color: '#3b82f6',
    start: '2026-07-20',
    end:   '2026-07-31',
    row: 2,
  },

  // ── Row 4 · O6 Personal stream (below separator) ──────────────────────────
  {
    id: 'personal-ai',
    label: 'Personal · AI-powered design',
    color: '#ec4899',
    start: '2026-03-16',
    end:   '2026-07-31',
    row: 4,
  },

];
