import { useMemo } from 'react';
import { blocks } from '../data/workload.js';
import { OKR_W } from './OkrPanel.jsx';

export const PRIORITIES_H = 48;

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getWeekBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay(); // 0 = Sun
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  return { weekStart: mon, weekEnd: fri };
}

export default function WeeklyPriorities() {
  const activeBlocks = useMemo(() => {
    const { weekStart, weekEnd } = getWeekBounds();
    return blocks.filter((b) => {
      const s = parseDate(b.start);
      const e = parseDate(b.end);
      return s <= weekEnd && e >= weekStart;
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 48,
        left: OKR_W,
        right: 0,
        height: PRIORITIES_H,
        background: 'rgba(255,254,251,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8e4dd',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
        zIndex: 99,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#c8c3bb',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        This week
      </span>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {activeBlocks.map((b) => (
          <div
            key={b.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: `${b.color}12`,
              border: `1px solid ${b.color}30`,
              borderRadius: 6,
              padding: '4px 11px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: b.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#2a2a3e' }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
