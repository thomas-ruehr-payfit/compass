# Compass — Design Document

A personal workload visualisation tool: a pannable, zoomable timeline displayed in the browser, fed by a single data file you update through prompting.

---

## Purpose

The tool gives a bird's-eye view of ongoing and upcoming work across a rolling ~7-month window. It is intentionally read-only — there is no in-app editing. The workflow is:

1. Describe a change in plain language to the AI assistant.
2. The assistant edits `src/data/workload.js`.
3. Redeploy (or use the local dev server) to see the update.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Vite + React (plain JS) | Zero config, instant HMR, auto-detected by Vercel |
| Styling | Inline styles | No build step for CSS, co-located with component logic |
| Fonts | Inter via Google Fonts | Clean, readable at small sizes |
| Deployment | Vercel | `npm run build` → `dist/` → connect repo, done |

No state management library, no CSS framework, no router. The entire runtime is ~150 KB gzipped.

---

## File structure

```
/
├── index.html                  HTML shell, loads Inter font
├── vite.config.js              Vite + React plugin
├── vercel.json                 Build command + output dir hints
├── package.json
├── DESIGN.md                   This file
└── src/
    ├── main.jsx                React root mount
    ├── index.css               Global reset + body background
    ├── App.jsx                 Top-level shell, zoom state, header bar
    ├── data/
    │   └── workload.js         ← THE ONLY FILE YOU EDIT
    └── components/
        ├── Canvas.jsx          Pan + zoom gesture layer
        ├── Timeline.jsx        Grid, header rows, block positioning
        └── Block.jsx           Individual project block + tooltip
```

---

## Data file — `src/data/workload.js`

This is the single source of truth. It exports one array of block objects.

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

### Rules

- **Dates must be weekdays.** Projects do not start or end on Saturday or Sunday.
- **Row assignment is manual.** Use `row: 0` for everything unless two projects overlap in time, in which case one of them must move to `row: 1` (or higher). A row only needs to exist where blocks actually overlap — do not pre-allocate empty rows.
- **Sequential blocks on the same row are fine.** As long as there is no date overlap, two projects can share a row even if they are unrelated.

### Current colour palette

The existing blocks use a coherent palette:

| Project family | Colour |
|---|---|
| Unity Patterns phases | `#6366f1` → `#c084fc` (indigo to light purple, sequential) |
| CDMS | `#3b82f6` (blue) |
| Orion | `#10b981` (emerald) |
| Back Office navigation | `#f59e0b` (amber) |

---

## Component architecture

```
App
├── (fixed) Header bar          title + "Today" button
└── Canvas                      pan / zoom gesture wrapper
    └── Timeline                the full timeline grid + all blocks
        └── Block (×n)          one per entry in workload.js
```

### App — `src/App.jsx`

Owns the single piece of React state: `dayWidth` (pixels per day, default 40).

Also maintains `dayWidthRef` — a ref that mirrors `dayWidth` — so the zoom handler can read the current value synchronously without waiting for a re-render.

**`goToToday()`** resets the canvas translate so today appears ~200 px from the left edge of the viewport at the current zoom level.

**`onZoom(deltaY, cursorX)`** is called by Canvas on pinch events. It:
1. Reads `prev` from `dayWidthRef`.
2. Computes `next = clamp(prev × factor, 6, 160)`.
3. Reads the current translate from `canvasRef.getTranslate()`.
4. Computes a new translate that keeps the canvas point under `cursorX` fixed:
   `newTx = cursorX − (cursorX − tx) × (next / prev)`
5. Writes `dayWidthRef.current = next`, calls `canvasRef.reset(newTx, ty)`, then calls `setDayWidth(next)` to trigger the Timeline re-render.

The side effects (DOM mutation via `reset`) happen **before** `setDayWidth`, and entirely **outside** the state-updater callback, to avoid React Strict Mode's double-invocation problem.

---

### Canvas — `src/components/Canvas.jsx`

A `forwardRef` component that wraps its children in a full-viewport overflow-hidden container. All panning and zoom detection happens here; no React state is involved — transforms are applied directly to `innerRef.current.style.transform`.

**Panning (mouse drag)**
- `mousedown` → sets `isDragging`, records starting position.
- `mousemove` → accumulates delta into `translate.current`, applies `translate(x, y)`.
- `mouseup` / `mouseleave` → clears `isDragging`.
- Elements with `data-no-pan` attribute are excluded (used on the Today button and tooltips).

**Panning (trackpad scroll)**
- `wheel` without `ctrlKey` → subtracts `deltaX`/`deltaY` from translate and applies it.

**Zoom (trackpad pinch)**
- `wheel` with `ctrlKey` → macOS reports pinch gestures this way.
- Calls `onZoomRef.current(deltaY, clientX)` (uses a ref to avoid stale closure).

**Imperative API (via `useImperativeHandle`)**

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

**Header alignment**
The day-number cells use `borderLeft` (not `borderRight`). With `box-sizing: border-box`, `borderLeft` on cell `i` lands at exactly `i × dayWidth` — the same pixel column as the absolute-positioned grid line beneath it. Using `borderRight` would place the separator 1 px to the left of the grid line, causing visible misalignment.

**Zoom-responsive day labels**
The density of day-number labels adapts to `dayWidth`:

| dayWidth | Labels shown |
|---|---|
| ≥ 30 px | Every day |
| ≥ 15 px | Every 5th day |
| ≥ 8 px | Every 10th day |
| < 8 px | None (only today marker) |

**Visual layers (z-index)**

| z-index | Element |
|---|---|
| 1 | Weekend shading, today column tint |
| 2 | Vertical day grid lines |
| 5 | Month header row, day-number header row |
| 10 | Today vertical red line |
| 20 | Blocks (default) |
| 30 | Hovered block |
| 50 | Block tooltip |

---

### Block — `src/components/Block.jsx`

Renders one absolutely-positioned block. Receives pre-computed `left`, `top`, `width` from Timeline so it does no date arithmetic itself.

- Labels are hidden (`tooNarrow = width < 60 px`) when the block is too small to fit text.
- On hover: opacity increases to 1, a coloured glow `box-shadow` appears, and a tooltip pops up above the block showing the project name, date range, and duration in days.
- The tooltip carries `data-no-pan` so hovering over it does not accidentally start a canvas drag.

---

## Interaction model

| Gesture | Effect |
|---|---|
| Click + drag | Pan the canvas in any direction |
| Two-finger scroll (trackpad) | Pan horizontally and vertically |
| Pinch (trackpad) | Zoom in / out, anchored to cursor position |
| Hover over block | Show tooltip with name, dates, and duration |
| "Today" button | Snap canvas so today is 200 px from the left edge |

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

Every push to the connected branch triggers a redeploy. Updating your workload is therefore:

1. Ask the AI to edit `src/data/workload.js`.
2. Commit and push.
3. Vercel redeploys in ~15 seconds.
