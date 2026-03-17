import { useMemo } from 'react';
import { blocks } from '../data/workload.js';
import { objectives } from '../data/okrs.js';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function getWeekBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  return { weekStart: mon, weekEnd: fri };
}

export default function WeekView() {
  const { weekStart, weekEnd } = useMemo(() => getWeekBounds(), []);

  const activeBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const s = parseDate(b.start);
      const e = parseDate(b.end);
      return s <= weekEnd && e >= weekStart;
    });
  }, [weekStart, weekEnd]);

  // Reverse map: blockId → objective
  const blockToObjective = useMemo(() => {
    const map = {};
    objectives.forEach((obj) => {
      (obj.blockIds ?? []).forEach((id) => { map[id] = obj; });
    });
    return map;
  }, []);

  const weekLabel = `${fmtDate(weekStart.toISOString().slice(0, 10))} – ${fmtDate(weekEnd.toISOString().slice(0, 10))}`;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 60px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Week label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#c8c3bb',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Week of
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6560' }}>
            {weekLabel}
          </span>
        </div>

        {/* Project cards */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#c8c3bb',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            This week
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {activeBlocks.map((b) => {
              const obj = blockToObjective[b.id];
              return (
                <div
                  key={b.id}
                  style={{
                    flex: '1 1 180px',
                    minWidth: 160,
                    maxWidth: 240,
                    background: '#ffffff',
                    border: '1px solid #e8e4dd',
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ height: 5, background: b.color }} />
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 5, lineHeight: 1.3 }}>
                      {b.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#b0aaa0', marginBottom: obj ? 10 : 0 }}>
                      {fmtDate(b.start)} → {fmtDate(b.end)}
                    </div>
                    {obj && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6,
                          borderTop: '1px solid #f0ede8',
                          paddingTop: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 3,
                            borderRadius: 2,
                            background: obj.color,
                            alignSelf: 'stretch',
                            flexShrink: 0,
                            minHeight: 12,
                            marginTop: 1,
                          }}
                        />
                        <span style={{ fontSize: 10, color: '#9a948e', lineHeight: 1.5 }}>
                          {obj.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
