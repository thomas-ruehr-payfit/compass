import { useMemo } from 'react';
import Block from './Block.jsx';
import { blocks, offPeriods } from '../data/workload.js';

// ─── Layout constants ───────────────────────────────────────────────────────
export const DAY_WIDTH = 40;       // default px per day (used for initial offset calc)
const MONTH_ROW_H = 34;            // height of month label row
const DAY_ROW_H = 26;              // height of day-number row
export const HEADER_H = MONTH_ROW_H + DAY_ROW_H;
export const ROW_H = 54;           // height per project row
const BLOCK_H = 38;                // height of a block
export const PADDING_TOP = 16;     // padding above first row
export const PADDING_BOTTOM = 60;  // extra space below last row

// ─── Personal stream separator ───────────────────────────────────────────────
// Rows with index >= PERSONAL_ROW_START are drawn below an extra gap + divider.
export const PERSONAL_ROW_START = 4;
export const SEPARATOR_EXTRA = 40; // extra vertical space reserved for the divider

// ─── Timeline date range ─────────────────────────────────────────────────────
export const PAST_DAYS = 75;       // days to show before today (back to early Jan)
const FUTURE_DAYS = 200;           // days to show after today
export const TOTAL_DAYS = PAST_DAYS + FUTURE_DAYS;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export default function Timeline({ dayWidth = DAY_WIDTH, onBlockOpen }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const startDate = useMemo(() => addDays(today, -PAST_DAYS), [today]);

  // All days in range
  const days = useMemo(
    () => Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(startDate, i)),
    [startDate],
  );

  // Group consecutive days by month for the header
  const months = useMemo(() => {
    const result = [];
    let current = null;
    days.forEach((day, i) => {
      const key = `${day.getFullYear()}-${day.getMonth()}`;
      if (!current || current.key !== key) {
        current = { key, year: day.getFullYear(), month: day.getMonth(), startIdx: i, count: 1 };
        result.push(current);
      } else {
        current.count++;
      }
    });
    return result;
  }, [days]);

  const maxRow = useMemo(
    () => (blocks.length === 0 ? 1 : Math.max(...blocks.map((b) => b.row)) + 1),
    [],
  );

  const hasPersonalRows = maxRow > PERSONAL_ROW_START;

  const totalWidth = TOTAL_DAYS * dayWidth;
  const totalHeight =
    HEADER_H + PADDING_TOP +
    maxRow * ROW_H +
    (hasPersonalRows ? SEPARATOR_EXTRA : 0) +
    PADDING_BOTTOM;
  const todayIdx = PAST_DAYS;

  // Show day numbers more densely when zoomed in, sparsely when zoomed out
  const dayLabelInterval = dayWidth >= 30 ? 1 : dayWidth >= 15 ? 5 : dayWidth >= 8 ? 10 : 0;

  // Y position of the separator line (midpoint of the gap before personal rows)
  const separatorY = hasPersonalRows
    ? HEADER_H + PADDING_TOP + PERSONAL_ROW_START * ROW_H + SEPARATOR_EXTRA / 2
    : null;

  // Compute absolute positions for each block
  const positionedBlocks = useMemo(() => {
    return blocks.map((block) => {
      const s = new Date(block.start + 'T00:00:00');
      const e = new Date(block.end + 'T00:00:00');
      const startIdx = daysBetween(startDate, s);
      const endIdx = daysBetween(startDate, e);
      const spanDays = endIdx - startIdx + 1;
      const extra = block.row >= PERSONAL_ROW_START ? SEPARATOR_EXTRA : 0;
      return {
        ...block,
        left: startIdx * dayWidth,
        width: spanDays * dayWidth,
        top: HEADER_H + PADDING_TOP + block.row * ROW_H + extra + (ROW_H - BLOCK_H) / 2,
      };
    });
  }, [startDate, dayWidth]);

  return (
    <div
      style={{
        position: 'relative',
        width: totalWidth,
        height: totalHeight,
        userSelect: 'none',
      }}
    >
      {/* ── Month header row ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: totalWidth,
          height: MONTH_ROW_H,
          background: '#fffefb',
          borderBottom: '1px solid #e8e4dd',
          display: 'flex',
          zIndex: 5,
        }}
      >
        {months.map((m) => (
          <div
            key={m.key}
            style={{
              width: m.count * dayWidth,
              height: MONTH_ROW_H,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 12,
              fontSize: 11,
              fontWeight: 600,
              color: '#a8a39a',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderLeft: '1px solid #e8e4dd',
              overflow: 'hidden',
            }}
          >
            {MONTH_NAMES[m.month]} {m.year}
          </div>
        ))}
      </div>

      {/* ── Day number row ── */}
      <div
        style={{
          position: 'absolute',
          top: MONTH_ROW_H,
          left: 0,
          width: totalWidth,
          height: DAY_ROW_H,
          background: '#fffefb',
          borderBottom: '1px solid #e8e4dd',
          display: 'flex',
          zIndex: 5,
        }}
      >
        {days.map((day, i) => {
          const isToday = i === todayIdx;
          const dow = day.getDay();
          const isWeekend = dow === 0 || dow === 6;
          const isMonthStart = day.getDate() === 1;
          const showLabel = isToday || day.getDate() === 1 ||
            (dayLabelInterval > 0 && day.getDate() % dayLabelInterval === 0);
          return (
            <div
              key={i}
              style={{
                width: dayWidth,
                height: DAY_ROW_H,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#ef4444' : isWeekend ? '#ccc8c0' : isMonthStart ? '#a8a39a' : '#c8c3bb',
                borderLeft: isMonthStart ? '1px solid #dedad3' : '1px solid #eeebe5',
                background: isToday ? 'rgba(239,68,68,0.06)' : 'transparent',
              }}
            >
              {showLabel && (isToday ? '●' : day.getDate())}
            </div>
          );
        })}
      </div>

      {/* ── Weekend column shading ── */}
      {days.map((day, i) => {
        const dow = day.getDay();
        if (dow !== 0 && dow !== 6) return null;
        return (
          <div
            key={`weekend-${i}`}
            style={{
              position: 'absolute',
              top: HEADER_H,
              left: i * dayWidth,
              width: dayWidth,
              height: totalHeight - HEADER_H,
              background: 'rgba(0,0,0,0.025)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        );
      })}

      {/* ── Today column highlight ── */}
      <div
        style={{
          position: 'absolute',
          top: HEADER_H,
          left: todayIdx * dayWidth,
          width: dayWidth,
          height: totalHeight - HEADER_H,
          background: 'rgba(239,68,68,0.05)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Vertical day grid lines ── */}
      {days.map((day, i) => {
        const isMonthStart = day.getDate() === 1;
        return (
          <div
            key={`line-${i}`}
            style={{
              position: 'absolute',
              top: HEADER_H,
              left: i * dayWidth,
              width: 1,
              height: totalHeight - HEADER_H,
              background: isMonthStart ? '#dedad3' : '#eeebe5',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        );
      })}

      {/* ── Today vertical line ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: todayIdx * dayWidth + Math.floor(dayWidth / 2),
          width: 1,
          height: totalHeight,
          background: 'rgba(239,68,68,0.45)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* ── Out-of-office bands ── */}
      {offPeriods.map((period) => {
        const s = new Date(period.start + 'T00:00:00');
        const e = new Date(period.end + 'T00:00:00');
        const startIdx = daysBetween(startDate, s);
        const endIdx = daysBetween(startDate, e);
        const spanDays = endIdx - startIdx + 1;
        const left = startIdx * dayWidth;
        const width = spanDays * dayWidth;
        return (
          <div key={period.id} style={{ position: 'absolute', top: 0, left, width, height: totalHeight, pointerEvents: 'none', zIndex: 4 }}>
            {/* Shaded fill — content area only */}
            <div
              style={{
                position: 'absolute',
                top: HEADER_H,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(0,0,0,0.025) 5px, rgba(0,0,0,0.025) 10px)',
                backgroundColor: 'rgba(180,170,155,0.08)',
              }}
            />
            {/* Label — pinned to the top of the hatched area, centred horizontally */}
            <div
              style={{
                position: 'absolute',
                top: HEADER_H,
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#b0a898',
                  background: 'rgba(255,254,251,0.9)',
                  padding: '2px 7px',
                  borderRadius: 4,
                  border: '1px solid #e0dbd2',
                  whiteSpace: 'nowrap',
                }}
              >
                {period.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* ── Personal stream separator ── */}
      {separatorY !== null && (
        <div
          style={{
            position: 'absolute',
            top: separatorY,
            left: 0,
            width: totalWidth,
            height: 1,
            background: '#e0dbd2',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      )}

      {/* ── Project blocks ── */}
      {positionedBlocks.map((block) => (
        <Block key={block.id} block={block} height={BLOCK_H} onOpen={onBlockOpen} />
      ))}
    </div>
  );
}
