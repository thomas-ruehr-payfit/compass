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

export default function FocusOverlay({ onDismiss }) {
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
        position: 'fixed',
        inset: 0,
        background: '#fffefb',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Inner content — max width */}
      <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Top: logo + week label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#6366f1',
                boxShadow: '0 0 10px #6366f144',
              }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.02em' }}>
              Compass
            </span>
          </div>
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#c8c3bb',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginRight: 8,
              }}
            >
              Week of
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6560' }}>
              {weekLabel}
            </span>
          </div>
        </div>

        {/* Middle: project cards */}
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
                  {/* Colour bar */}
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

        {/* Bottom: dismiss button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.22)',
              borderRadius: 8,
              color: '#6366f1',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 28px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
          >
            View timeline →
          </button>
        </div>

      </div>
    </div>
  );
}
