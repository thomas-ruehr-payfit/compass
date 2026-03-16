import { objectives } from '../data/okrs.js';

export const OKR_W = 260;

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
        {objectives.map((obj) => (
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
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#2a2a3e',
                    lineHeight: 1.45,
                    marginBottom: obj.keyResults.length > 0 ? 6 : 0,
                  }}
                >
                  {obj.title}
                </div>

                {/* Key results */}
                {obj.keyResults.map((kr) => (
                  <div
                    key={kr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: obj.color,
                        marginTop: 2,
                        flexShrink: 0,
                        opacity: 0.7,
                      }}
                    >
                      ↳
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: '#9a948e',
                        lineHeight: 1.5,
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
