# Compass — Design Document

A personal workload visualisation tool: a pannable, zoomable timeline displayed in the browser, connected to a set of data files you update through AI prompting.

---

## Purpose

The tool gives a bird's-eye view of ongoing and upcoming work across a rolling ~7-month window. It is intentionally read-only — there is no in-app editing. The workflow is:

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
└── src/
    ├── main.jsx                      React root mount
    ├── index.css                     Global reset, body background, markdown prose styles
    ├── App.jsx                       Top-level shell: zoom, header, overlay state
    ├── data/
    │   ├── workload.js               ← Timeline blocks (the primary file to edit)
    │   ├── okrs.js                   ← Objectives + key results
    │   ├── projectDocs.js            Vite glob loader for all project DESIGN.md files
    │   └── projects/
    │       ├── cdms/DESIGN.md
    │       ├── unity-1/DESIGN.md
    │       ├── unity-2/DESIGN.md
    │       ├── unity-3/DESIGN.md
    │       ├── unity-4/DESIGN.md
    │       ├── unity-5/DESIGN.md
    │       ├── backoffice/DESIGN.md
    │       └── orion/DESIGN.md
    └── components/
        ├── Canvas.jsx                Pan + zoom gesture layer
        ├── Timeline.jsx              Grid, header rows, block positioning
        ├── Block.jsx                 Individual project block + tooltip + click
        ├── WeeklyPriorities.jsx      Fixed bar: active blocks this week
        ├── OkrPanel.jsx              Fixed left panel: objectives + key results
        ├── ProjectModal.jsx          Modal: renders a project's DESIGN.md
        └── FocusOverlay.jsx          Full-page overlay shown on every page load
```

---

## Data files

### `src/data/workload.js`

The primary source of truth for the timeline. Exports one array of block objects.

```js
export const blocks = [
  {
    id:    'my-project',          // unique string, never reused
    label: 'My Project',          // display name shown inside the block
    color: '#6366f1',             // any hex colour
    start: '2026-04-01',          // YYYY-MM-DD, must be a weekday
    end:   '2026-04-30',          // YYYY-MM-DD, must be a weekday
    row:   0,                     // integer ≥ 0 (see Row assignment below)
  },
];
```

**Rules**

- **Dates must be weekdays.** Projects do not start or end on Saturday or Sunday.
- **Row assignment is manual.** Use `row: 0` for everything unless two projects overlap in time, in which case one of them must move to `row: 1` (or higher).
- **Sequential blocks on the same row are fine.** As long as there is no date overlap, two projects can share a row.

**Colour palette**

| Project family | Colour |
|---|---|
| Unity Patterns phases | `#6366f1` → `#c084fc` (indigo to light purple, sequential) |
| CDMS | `#3b82f6` (blue) |
| Orion | `#10b981` (emerald) |
| Back Office navigation | `#f59e0b` (amber) |

---

### `src/data/okrs.js`

Exports one array of objectives. Each objective is colour-matched to a block family and lists its key results and the block IDs it covers.

```js
export const objectives = [
  {
    id:       'okr-unity',
    title:    'Establish a unified design language across the product',
    color:    '#6366f1',
    blockIds: ['unity-1', 'unity-2', 'unity-3', 'unity-4', 'unity-5'],
    keyResults: [
      { id: 'kr-1', text: 'Ship all 5 Unity pattern phases before end of S1' },
    ],
  },
  // …
];
```

`blockIds` is used by `FocusOverlay` to reverse-map a timeline block to its parent objective.

---

### `src/data/projectDocs.js`

Uses Vite's `import.meta.glob` with `?raw` to load every `src/data/projects/*/DESIGN.md` file as a raw string at build time. Exports a plain object `{ [blockId]: markdownString }`.

---

### `src/data/projects/{id}/DESIGN.md`

One markdown file per block. Each file has at minimum:

```markdown
# Project Name

## Overview
…

## Notes
```

The `## Notes` section is where the AI appends quick notes (see **Note-taking workflow** below).

---

## Component architecture

```
App
├── (fixed z:300) FocusOverlay        full-page briefing on every page load
├── (fixed z:100) Header bar          title + "Today" button
├── (fixed z:98)  OkrPanel            objectives list, left side
├── (fixed z:99)  WeeklyPriorities    active-this-week chips, top bar
├── (fixed z:200) ProjectModal        project doc viewer, shown on block click
└── Canvas                            pan / zoom gesture wrapper
    └── Timeline                      the full timeline grid + all blocks
        └── Block (×n)                one per entry in workload.js
```

### App — `src/App.jsx`

Owns three pieces of React state:

| State | Default | Purpose |
|---|---|---|
| `dayWidth` | 40 | Pixels per day; drives Timeline re-render on zoom |
| `openBlock` | `null` | The block object whose modal is open, or null |
| `showFocus` | `true` | Whether the FocusOverlay is visible |

Also maintains `dayWidthRef` — a ref that mirrors `dayWidth` — so the zoom handler can read the current value synchronously without a re-render.

**`goToToday()`** resets the canvas translate so today appears ~200 px from the left edge of the viewport.

**`onZoom(deltaY, cursorX)`** adjusts `dayWidth` and the canvas translate so the point under the cursor stays fixed:
1. Reads `prev` from `dayWidthRef`.
2. Computes `next = clamp(prev × factor, 6, 160)`.
3. Reads the current translate from `canvasRef.getTranslate()`.
4. Computes `newTx = cursorX − (cursorX − tx) × (next / prev)`.
5. Writes `dayWidthRef.current = next`, calls `canvasRef.reset(newTx, ty)`, then calls `setDayWidth(next)`.

Side effects (DOM mutation via `reset`) happen before `setDayWidth` to avoid React Strict Mode's double-invocation problem.

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

**Imperative API**

| Method | Description |
|---|---|
| `reset(x, y)` | Sets translate to `(x, y)` and applies it to the DOM immediately. |
| `getTranslate()` | Returns `{ x, y }` of the current translate. |

---

### Timeline — `src/components/Timeline.jsx`

Renders a single wide `position: relative` div sized to cover the full date range. Everything inside is absolutely positioned.

**Date range**
- Starts `PAST_DAYS` (14) days before today.
- Ends `FUTURE_DAYS` (200) days after today.
- Total: 214 days. At the default `dayWidth` of 40 px this is 8560 px wide.

**Layout constants**

| Constant | Value | Purpose |
|---|---|---|
| `DAY_WIDTH` | 40 px | Default pixels per day (exported for App's initial offset) |
| `HEADER_H` | 60 px | Combined height of month row (34) + day row (26) |
| `ROW_H` | 54 px | Height of one project row |
| `BLOCK_H` | 38 px | Height of a rendered block |
| `PADDING_TOP` | 16 px | Space between header and first block row |
| `PADDING_BOTTOM` | 60 px | Space below the last block row |

**Block positioning formula**

```
block.left  = daysBetween(startDate, block.start) × dayWidth
block.width = (daysBetween(startDate, block.end) − daysBetween(startDate, block.start) + 1) × dayWidth
block.top   = HEADER_H + PADDING_TOP + block.row × ROW_H + (ROW_H − BLOCK_H) / 2
```

**Zoom-responsive day labels**

| dayWidth | Labels shown |
|---|---|
| ≥ 30 px | Every day |
| ≥ 15 px | Every 5th day |
| ≥ 8 px | Every 10th day |
| < 8 px | None (only today marker) |

---

### Block — `src/components/Block.jsx`

Renders one absolutely-positioned block. Receives pre-computed `left`, `top`, `width` from Timeline.

- Labels are hidden (`tooNarrow = width < 60 px`) when the block is too narrow to fit text.
- On hover: opacity increases, a coloured glow appears, and a tooltip shows name, date range, and duration.
- On click: calls `onOpen(block)` — `data-no-pan` prevents the click from starting a canvas drag.
- `cursor: pointer` when the block is clickable.

---

### WeeklyPriorities — `src/components/WeeklyPriorities.jsx`

A fixed bar sitting between the header and the timeline (top: 48, left: `OKR_W`, right: 0, height: 48). Computes the current Mon–Fri window at render time and filters `blocks` to those whose date range intersects it. Renders each as a small colour-coded chip. Updates automatically each week — no manual editing required.

---

### OkrPanel — `src/components/OkrPanel.jsx`

A fixed left panel (left: 0, top: 48, bottom: 0, width: `OKR_W = 260`). Renders objectives from `okrs.js`, each with a 3px colour bar on the left, its title, and key results indented beneath. Exports `OKR_W` so other components can align themselves to the right of it.

---

### ProjectModal — `src/components/ProjectModal.jsx`

Shown when a block is clicked. Renders a centred panel over a blurred backdrop.

- Header: colour dot, project name, date range, close button.
- Body: the raw markdown of `src/data/projects/{id}/DESIGN.md` rendered via `react-markdown`, styled by `.md-body` CSS rules in `index.css`.
- Closes on backdrop click or `Escape` key.
- All elements carry `data-no-pan`.

---

### FocusOverlay — `src/components/FocusOverlay.jsx`

Shown on every page load (`showFocus` defaults to `true` in App). Dismissed by the "View timeline →" button which sets `showFocus` to `false`.

- Full-page white overlay (`z-index: 300`, above all other UI).
- Shows the current week label and one card per block active this week.
- Each card: 5 px colour bar, project name, date range, linked OKR title (reverse-mapped via `blockIds`).

---

## Visual layer stack (z-index)

| z-index | Element |
|---|---|
| 1 | Weekend shading, today column tint |
| 2 | Vertical day grid lines |
| 5 | Month header row, day-number header row |
| 10 | Today vertical red line |
| 20 | Blocks (default) |
| 30 | Hovered block |
| 50 | Block tooltip |
| 98 | OkrPanel |
| 99 | WeeklyPriorities |
| 100 | Header bar |
| 200 | ProjectModal |
| 300 | FocusOverlay |

---

## Interaction model

| Gesture / action | Effect |
|---|---|
| Page load | FocusOverlay appears with this week's project cards |
| "View timeline →" button | Dismisses FocusOverlay, reveals the timeline |
| Click + drag | Pan the canvas in any direction |
| Two-finger scroll (trackpad) | Pan horizontally and vertically |
| Pinch (trackpad) | Zoom in / out, anchored to cursor position |
| Hover over block | Show tooltip with name, dates, and duration |
| Click on block | Open ProjectModal with the project's DESIGN.md |
| "Today" button | Snap canvas so today is ~200 px from the left edge |

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
