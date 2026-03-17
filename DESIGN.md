# Compass — Design Document

A personal workload visualisation tool: a pannable, zoomable timeline displayed in the browser, connected to a set of data files you update through AI prompting.

---

## Purpose

The tool gives a bird's-eye view of ongoing and upcoming work across a rolling ~9-month window (Jan → Jul). It is intentionally read-only — there is no in-app editing. The workflow is:

1. Describe a change in plain language to the AI assistant.
2. The assistant edits the appropriate data file (`workload.js`, `okrs.js`, or a project `DESIGN.md`).
3. Redeploy (or use the local dev server) to see the update.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Vite + React (plain JS) | Zero config, instant HMR, auto-detected by Vercel |
| Styling | Inline styles + one CSS file | No build step for CSS, co-located with component logic |
| Markdown rendering | `react-markdown` | Renders per-project DESIGN.md files inside the modal |
| Fonts | Inter via Google Fonts | Clean, readable at small sizes |
| Deployment | Vercel | `npm run build` → `dist/` → connect repo, done |

No state management library, no CSS framework, no router.

---

## File structure

```
/
├── index.html                        HTML shell, loads Inter font
├── vite.config.js                    Vite + React plugin
├── vercel.json                       Build command + output dir hints
├── package.json
├── DESIGN.md                         This file
├── ROADMAP.md                        Objectives + timeline blocks source of truth
├── compass-logo.svg                  Wordmark SVG used in the header
├── compass-icon.svg                  Icon-only SVG (available for use)
└── src/
    ├── main.jsx                      React root mount
    ├── index.css                     Global reset, body background, markdown prose styles
    ├── App.jsx                       Top-level shell: tab state, zoom, header
    ├── data/
    │   ├── workload.js               ← Timeline blocks + off periods (primary file to edit)
    │   ├── okrs.js                   ← Objectives + key results (with completion state)
    │   ├── projectDocs.js            Vite glob loader for all project DESIGN.md files
    │   └── projects/
    │       └── {id}/DESIGN.md        One markdown file per block id
    └── components/
        ├── Canvas.jsx                Pan + zoom gesture layer
        ├── Timeline.jsx              Grid, header rows, OOO bands, block positioning
        ├── Block.jsx                 Individual project block + tooltip + click
        ├── WeekView.jsx              "This Week" tab content: active block cards
        ├── OkrPanel.jsx              Fixed left panel: objectives + key results
        └── ProjectModal.jsx          Modal: renders a project's DESIGN.md
```

> `FocusOverlay.jsx` and `WeeklyPriorities.jsx` still exist on disk but are no longer used. They were replaced by the two-tab navigation and `WeekView`.

---

## Data files

### `src/data/workload.js`

The primary source of truth for the timeline. Exports two arrays.

#### `blocks`

```js
export const blocks = [
  {
    id:    'my-project',   // unique string, never reused
    label: 'My Project',   // display name shown inside the block
    color: '#6366f1',      // any hex colour
    start: '2026-04-01',   // YYYY-MM-DD, must be a weekday
    end:   '2026-04-30',   // YYYY-MM-DD, must be a weekday
    row:   0,              // integer ≥ 0 (see Row assignment below)
  },
];
```

**Row assignment**

| Row | Content |
|---|---|
| 0 | O6 JetLang (past), then O1 Unity patterns |
| 1 | O7 Compliance (past), then O2 BackOffice, then O3 Orion, then O5 Processor |
| 2 | O8 CDMS (past), then O2 BackOffice Prototype, then O4 Access & Permissions |
| 3 | *(empty — acts as visual spacing before the separator)* |
| 4 | O9 Personal stream (below the separator line) |

Rows ≥ 4 (`PERSONAL_ROW_START`) are rendered below an extra 40 px gap and a horizontal divider line, visually separating the personal stream from project work.

#### `offPeriods`

Used to render a hatched "out of office" band over the timeline:

```js
export const offPeriods = [
  { id: 'ooo-apr', label: 'Out of office', start: '2026-04-13', end: '2026-04-17' },
];
```

Each entry produces a diagonal-hatch overlay spanning the full height of the content area, with a small label pill pinned to the top edge.

---

### `src/data/okrs.js`

Exports one array of objectives. Supports completion state at both the objective and key-result level.

```js
export const objectives = [
  {
    id:        'okr-unity',
    title:     'Deliver a production-ready Unity pattern set by June 12, 2026',
    color:     '#6366f1',
    completed: false,              // true → muted title + ✓ badge; sorted to bottom of panel
    blockIds:  ['unity-setup', 'unity-person-entity', /* … */],
    keyResults: [
      { id: 'kr-u1', text: 'Finalize 5 patterns by June 12, 2026', done: false },
      // done: true → filled circle + strikethrough text in the panel
    ],
  },
];
```

`blockIds` is used by `WeekView` to reverse-map a timeline block to its parent objective.

**Colour palette**

| Objective | Colour |
|---|---|
| O1 Unity Patterns | `#6366f1` (indigo) |
| O2 BackOffice Navigation | `#f59e0b` (amber) |
| O3 Orion | `#10b981` (emerald) |
| O4 Access & Permissions | `#3b82f6` (blue) |
| O5 Processor migration | `#64748b` (slate) |
| O6 JetLang unit testing ✓ | `#06b6d4` (cyan) |
| O7 Compliance testing ✓ | `#f97316` (orange) |
| O8 CDMS | `#e11d48` (rose) |
| O9 Personal | `#ec4899` (pink) |

---

### `src/data/projectDocs.js`

Uses Vite's `import.meta.glob` with `?raw` to load every `src/data/projects/*/DESIGN.md` file as a raw string at build time. Exports a plain object `{ [blockId]: markdownString }`. Block IDs must match folder names exactly.

---

## Component architecture

```
App
├── (fixed z:100) Header bar          logo + tabs (This Week / Timeline)
├── (fixed z:98)  OkrPanel            objectives list, left side
├── (fixed z:200) ProjectModal        project doc viewer, shown on block click
└── Body (paddingTop: 48)
    ├── [Tab: "This Week"]  WeekView   active-this-week block cards
    └── [Tab: "Timeline"]
        ├── OkrPanel (already fixed)
        └── Canvas                    pan / zoom gesture wrapper
            └── Timeline              grid, OOO bands, separator, all blocks
                └── Block (×n)        one per entry in workload.js
```

---

### App — `src/App.jsx`

Owns three pieces of React state:

| State | Default | Purpose |
|---|---|---|
| `activeTab` | `'week'` | Which tab is active: `'week'` or `'timeline'` |
| `dayWidth` | 40 | Pixels per day; drives Timeline re-render on zoom |
| `openBlock` | `null` | The block object whose modal is open, or null |

Also maintains `dayWidthRef` — a ref that mirrors `dayWidth` — so the zoom handler can read the current value synchronously without a re-render.

**Vertical centering** — `INITIAL_Y` is computed at module level from `window.innerHeight`, the nav bar height (48 px), and the static timeline height (derived from exported layout constants). This ensures the timeline rows are vertically centred in the viewport on first load.

**`onZoom(deltaY, cursorX)`** adjusts `dayWidth` and the canvas translate so the point under the cursor stays fixed:
1. Reads `prev` from `dayWidthRef`.
2. Computes `next = clamp(prev × factor, 6, 160)`.
3. Reads the current translate from `canvasRef.getTranslate()`.
4. Computes `newTx = cursorX − (cursorX − tx) × (next / prev)`.
5. Writes `dayWidthRef.current = next`, calls `canvasRef.reset(newTx, ty)`, then calls `setDayWidth(next)`.

---

### Canvas — `src/components/Canvas.jsx`

A `forwardRef` component that wraps its children in an overflow-hidden container. All panning and zoom detection happens here; no React state is involved — transforms are applied directly to the DOM.

**Panning (mouse drag)**
- `mousedown` → sets `isDragging`, records starting position.
- `mousemove` → accumulates delta into `translate.current`, applies `translate(x, y)`.
- `mouseup` / `mouseleave` → clears `isDragging`.
- Elements with `data-no-pan` attribute are excluded.

**Panning (trackpad scroll)**
- `wheel` without `ctrlKey` → subtracts `deltaX`/`deltaY` from translate.

**Zoom (trackpad pinch)**
- `wheel` with `ctrlKey` → calls `onZoomRef.current(deltaY, clientX)`.
- The wheel listener is attached via `addEventListener({ passive: false })` — **not** via React's `onWheel` prop — so that `e.preventDefault()` is respected and the browser's native page zoom is suppressed.

**Imperative API**

| Method | Description |
|---|---|
| `reset(x, y)` | Sets translate to `(x, y)` and applies it to the DOM immediately. |
| `getTranslate()` | Returns `{ x, y }` of the current translate. |

---

### Timeline — `src/components/Timeline.jsx`

Renders a single wide `position: relative` div sized to cover the full date range. Everything inside is absolutely positioned.

**Date range**
- Starts `PAST_DAYS` (75) days before today — reaches back to early January.
- Ends `FUTURE_DAYS` (200) days after today.
- Total: 275 days. At the default `dayWidth` of 40 px this is 11 000 px wide.

**Layout constants** (all exported)

| Constant | Value | Purpose |
|---|---|---|
| `DAY_WIDTH` | 40 px | Default pixels per day |
| `HEADER_H` | 60 px | Month row (34) + day row (26) |
| `ROW_H` | 54 px | Height of one project row |
| `PADDING_TOP` | 16 px | Space between header and first block row |
| `PADDING_BOTTOM` | 60 px | Space below the last row |
| `PERSONAL_ROW_START` | 4 | First row index of the personal stream |
| `SEPARATOR_EXTRA` | 40 px | Extra gap + divider before personal rows |

**Block top formula**

```
extra = block.row >= PERSONAL_ROW_START ? SEPARATOR_EXTRA : 0
top   = HEADER_H + PADDING_TOP + block.row × ROW_H + extra + (ROW_H − BLOCK_H) / 2
```

**Total height formula**

```
totalHeight = HEADER_H + PADDING_TOP + maxRow × ROW_H
            + (hasPersonalRows ? SEPARATOR_EXTRA : 0)
            + PADDING_BOTTOM
```

**Zoom-responsive day labels**

| dayWidth | Labels shown |
|---|---|
| ≥ 30 px | Every day |
| ≥ 15 px | Every 5th day |
| ≥ 8 px | Every 10th day |
| < 8 px | None (only today marker) |

**Completed block detection** — Timeline imports `objectives` from `okrs.js` and builds a `completedBlockIds` Set at render time (all `blockIds` of objectives where `completed === true`). Each positioned block receives a `completed` boolean derived from this set, which `Block` uses for its visual treatment.

**Out-of-office bands** — For each entry in `offPeriods`, a band is rendered from `top: 0` to `totalHeight`. It has two layers: a diagonal-hatch fill covering only the content area (below `HEADER_H`), and a label pill pinned flush to `HEADER_H` (touching the day-number row border).

**Personal stream separator** — A 1 px horizontal rule is drawn at `HEADER_H + PADDING_TOP + PERSONAL_ROW_START × ROW_H + SEPARATOR_EXTRA / 2` when any block with `row >= 4` exists.

---

### Block — `src/components/Block.jsx`

Renders one absolutely-positioned block. Receives pre-computed `left`, `top`, `width`, and `completed` from Timeline.

- Labels are hidden (`tooNarrow = width < 60 px`) when the block is too narrow to fit text.
- On hover: opacity increases, a coloured glow appears, and a tooltip shows name, date range, and duration.
- On click: calls `onOpen(block)` — `data-no-pan` prevents the click from starting a canvas drag.

**Completed state** — when `block.completed === true` (derived from its parent objective in Timeline):
- Base opacity drops to 0.35 (vs 0.88 for active blocks); hover lifts it to 0.55.
- A white diagonal hatch overlay (`repeating-linear-gradient 135°`) is layered inside the block, reinforcing the "done" state while keeping the colour recognisable.

---

### WeekView — `src/components/WeekView.jsx`

Shown when the "This Week" tab is active. Computes the current Mon–Fri window and filters `blocks` to those whose date range intersects it. Renders each as a card with:

- A 5 px colour bar at the top edge.
- Block label and date range.
- If the block is linked to an objective (via `blockIds`), a coloured left-border strip with the objective title.

---

### OkrPanel — `src/components/OkrPanel.jsx`

A fixed left panel (left: 0, top: 48, bottom: 0, width: `OKR_W = 300`). Renders objectives from `okrs.js`.

**Sorting** — Completed objectives (`obj.completed === true`) are sorted to the bottom of the list.

**Objective display**
- 3 px colour bar on the left.
- Title at 12 px / semibold. Muted (`#9a948e`) when completed.
- Completion badge: a 16 px filled circle with a `✓` glyph, shown when `obj.completed`.

**Key result display**
- Circle indicator: hollow (border only, 45% opacity) when `done: false`; solid filled (90% opacity) when `done: true`.
- Text: 12 px, `#9a948e`. Strikethrough when `done: true`.

---

### ProjectModal — `src/components/ProjectModal.jsx`

Shown when a block is clicked. Renders a centred panel over a blurred backdrop.

- Header: colour dot, project name, date range, close button.
- Body: the raw markdown of `src/data/projects/{id}/DESIGN.md` rendered via `react-markdown`.
- Closes on backdrop click or `Escape` key.
- All elements carry `data-no-pan`.

---

## Visual layer stack (z-index)

| z-index | Element |
|---|---|
| 1 | Weekend shading, today column tint |
| 2 | Vertical day grid lines |
| 3 | Personal stream separator line |
| 4 | Out-of-office bands |
| 5 | Month header row, day-number header row |
| 10 | Today vertical red line |
| 20 | Blocks (default) |
| 30 | Hovered block |
| 50 | Block tooltip |
| 98 | OkrPanel |
| 100 | Header bar |
| 200 | ProjectModal |

---

## Interaction model

| Gesture / action | Effect |
|---|---|
| Page load | "This Week" tab shown by default |
| Tab: "This Week" | Shows WeekView with active block cards for the current week |
| Tab: "Timeline" | Shows pannable/zoomable timeline with OkrPanel |
| Click + drag | Pan the canvas |
| Two-finger scroll (trackpad) | Pan horizontally and vertically |
| Pinch (trackpad) | Zoom in / out, anchored to cursor position |
| Hover over block | Show tooltip with name, dates, and duration |
| Click on block | Open ProjectModal with the project's DESIGN.md |

---

## Note-taking workflow

The Cursor rule at `.cursor/rules/project-notes.mdc` (always active) enables a shorthand for logging progress. In any Cursor chat window:

> `cdms: still waiting for peer feedback`

The AI will:
1. Match the identifier to a block id or label (fuzzy).
2. Tighten the phrasing.
3. Append a dated bullet to `src/data/projects/{id}/DESIGN.md` under `## Notes`:

```markdown
**Mar 16** — Still waiting for feedback from peers.
```

If `## Notes` does not yet exist in the file, it is created at the end.

---

## Deployment

```bash
# Local development
npm install
npm run dev        # → http://localhost:5173

# Production build
npm run build      # → dist/
npm run preview    # local preview of the built output
```

**Vercel**: connect the repository. Vercel auto-detects Vite and sets `npm run build` / `dist` automatically. `vercel.json` is present as an explicit fallback.

Every push to the connected branch triggers a redeploy. The full update workflow is:

1. Ask the AI to edit any data file (`workload.js`, `okrs.js`, or a project `DESIGN.md`).
2. Commit and push.
3. Vercel redeploys in ~15 seconds.
