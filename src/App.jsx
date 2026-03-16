import { useRef, useMemo, useState, useCallback } from 'react';
import Canvas from './components/Canvas.jsx';
import Timeline, { DAY_WIDTH, PAST_DAYS } from './components/Timeline.jsx';

const TODAY_VIEWPORT_OFFSET = 200;
const MIN_DAY_WIDTH = 6;
const MAX_DAY_WIDTH = 160;

export default function App() {
  const canvasRef = useRef(null);
  const [dayWidth, setDayWidth] = useState(DAY_WIDTH);
  const dayWidthRef = useRef(DAY_WIDTH);

  const initialX = useMemo(() => -(PAST_DAYS * DAY_WIDTH) + TODAY_VIEWPORT_OFFSET, []);

  function goToToday() {
    canvasRef.current?.reset(-(PAST_DAYS * dayWidthRef.current) + TODAY_VIEWPORT_OFFSET, 0);
  }

  // Called by Canvas when a pinch-to-zoom (ctrl+wheel) is detected.
  // Adjusts dayWidth and translates so the point under the cursor stays fixed.
  const onZoom = useCallback((deltaY, cursorX) => {
    const factor = 1 - deltaY * 0.012;
    const prev = dayWidthRef.current;
    const next = Math.max(MIN_DAY_WIDTH, Math.min(MAX_DAY_WIDTH, prev * factor));
    if (next === prev) return;

    const { x: tx, y: ty } = canvasRef.current?.getTranslate() ?? { x: 0, y: 0 };
    // Keep the day under cursorX fixed: newTx = cursorX - (cursorX - tx) * (next / prev)
    const newTx = cursorX - (cursorX - tx) * (next / prev);

    dayWidthRef.current = next;
    canvasRef.current?.reset(newTx, ty);
    setDayWidth(next);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#fffefb', position: 'relative' }}>
      {/* Header bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'rgba(255,254,251,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e8e4dd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#6366f1',
              boxShadow: '0 0 8px #6366f166',
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', letterSpacing: '0.02em' }}>
            Compass
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#b0aaa0', marginRight: 4 }}>
            drag to pan · pinch to zoom
          </span>
          <button
            data-no-pan
            onClick={goToToday}
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 6,
              color: '#f87171',
              fontSize: 12,
              fontWeight: 500,
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'background 0.15s',
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          >
            Today
          </button>
        </div>
      </div>

      {/* Pannable canvas */}
      <div style={{ paddingTop: 48, height: '100vh' }}>
        <Canvas ref={canvasRef} initialX={initialX} initialY={0} onZoom={onZoom}>
          <Timeline dayWidth={dayWidth} />
        </Canvas>
      </div>
    </div>
  );
}
