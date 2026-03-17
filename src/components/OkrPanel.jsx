import { objectives } from '../data/okrs.js';

export const OKR_W = 300;

const sortedObjectives = [...objectives].sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));

export default function OkrPanel() {
  return (
    <div
      data-no-pan
      style={{
        position: 'fixed',
        left: 0,
        top: 48,
        bottom: 0,
        width: OKR_W,
        background: '#fffefb',
        borderRight: '1px solid #e8e4dd',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 98,
      }}
    >
      {/* Panel label */}
      <div
        style={{
          padding: '14px 16px 10px',
          fontSize: 10,
          fontWeight: 700,
          color: '#c8c3bb',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        Objectives
      </div>

      {/* Objectives list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 0 20px' }}>
        {sortedObjectives.map((obj) => (
          <div key={obj.id} style={{ padding: '0 12px' }}>
            {/* Objective row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 4px 6px',
                borderRadius: 6,
              }}
            >
              {/* Colour bar */}
              <div
                style={{
                  width: 3,
                  borderRadius: 2,
                  background: obj.color,
                  alignSelf: 'stretch',
                  flexShrink: 0,
                  minHeight: 16,
                  marginTop: 2,
                }}
              />
              <div style={{ minWidth: 0 }}>
                {/* Title row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    marginBottom: obj.keyResults.length > 0 ? 6 : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: obj.completed ? '#9a948e' : '#2a2a3e',
                      lineHeight: 1.45,
                      flex: 1,
                    }}
                  >
                    {obj.title}
                  </span>
                  {obj.completed && (
                    <div
                      style={{
                        flexShrink: 0,
                        marginTop: 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: obj.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: 1 }}>✓</span>
                    </div>
                  )}
                </div>

                {/* Key results */}
                {obj.keyResults.map((kr) => (
                  <div
                    key={kr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 7,
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: kr.done ? obj.color : 'transparent',
                        border: `1.5px solid ${obj.color}`,
                        flexShrink: 0,
                        marginTop: 3,
                        opacity: kr.done ? 0.9 : 0.45,
                        boxSizing: 'border-box',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: kr.done ? '#b0aaa0' : '#9a948e',
                        lineHeight: 1.5,
                        textDecoration: kr.done ? 'line-through' : 'none',
                      }}
                    >
                      {kr.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider between objectives */}
            <div style={{ height: 1, background: '#f0ede8', margin: '2px 0 2px 13px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
