import { useMemo } from 'react';
import Block from './Block.jsx';
import { blocks } from '../data/workload.js';

// ─── Layout constants ───────────────────────────────────────────────────────
export const DAY_WIDTH = 40;       // default px per day (used for initial offset calc)
const MONTH_ROW_H = 34;            // height of month label row
const DAY_ROW_H = 26;              // height of day-number row
export const HEADER_H = MONTH_ROW_H + DAY_ROW_H;
const ROW_H = 54;                  // height per project row
const BLOCK_H = 38;                // height of a block
const PADDING_TOP = 16;            // padding above first row
const PADDING_BOTTOM = 60;         // extra space below last row

// ─── Timeline date range ─────────────────────────────────────────────────────
export const PAST_DAYS = 14;       // days to show before today
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

export default function Timeline({ dayWidth = DAY_WIDTH }) {
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

  const totalWidth = TOTAL_DAYS * dayWidth;
  const totalHeight = HEADER_H + PADDING_TOP + maxRow * ROW_H + PADDING_BOTTOM;
  const todayIdx = PAST_DAYS;

  // Show day numbers more densely when zoomed in, sparsely when zoomed out
  const dayLabelInterval = dayWidth >= 30 ? 1 : dayWidth >= 15 ? 5 : dayWidth >= 8 ? 10 : 0;

  // Compute absolute positions for each block
  const positionedBlocks = useMemo(() => {
    return blocks.map((block) => {
      const s = new Date(block.start + 'T00:00:00');
      const e = new Date(block.end + 'T00:00:00');
      const startIdx = daysBetween(startDate, s);
      const endIdx = daysBetween(startDate, e);
      const spanDays = endIdx - startIdx + 1;
      return {
        ...block,
        left: startIdx * dayWidth,
        width: spanDays * dayWidth,
        top: HEADER_H + PADDING_TOP + block.row * ROW_H + (ROW_H - BLOCK_H) / 2,
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

      {/* Row separators intentionally omitted — rows only exist where blocks overlap */}

      {/* ── Project blocks ── */}
      {positionedBlocks.map((block) => (
        <Block key={block.id} block={block} height={BLOCK_H} />
      ))}
    </div>
  );
}
