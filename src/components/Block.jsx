import { useState } from 'react';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function dayCount(start, end) {
  const a = new Date(start + 'T00:00:00');
  const b = new Date(end + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1;
}

export default function Block({ block, height, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const days = dayCount(block.start, block.end);
  const tooNarrow = block.width < 60;
  const { completed } = block;

  // Completed blocks are dimmed; hovering restores them slightly for tooltip access
  const baseOpacity = completed ? 0.35 : 0.88;
  const hoverOpacity = completed ? 0.55 : 1;

  return (
    <div
      data-no-pan
      onClick={() => onOpen?.(block)}
      style={{
        position: 'absolute',
        left: block.left + 3,
        top: block.top,
        width: Math.max(block.width - 6, 4),
        height,
        borderRadius: 7,
        background: block.color,
        opacity: hovered ? hoverOpacity : baseOpacity,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: tooNarrow ? 4 : 10,
        paddingRight: 6,
        fontSize: 12,
        fontWeight: 500,
        color: '#fff',
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        transition: 'opacity 0.15s ease, box-shadow 0.12s ease',
        boxShadow: hovered
          ? `0 4px 20px ${block.color}44, 0 1px 4px rgba(0,0,0,0.12)`
          : `0 2px 8px rgba(0,0,0,0.12)`,
        zIndex: hovered ? 30 : 20,
        letterSpacing: '0.01em',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Diagonal hatch overlay for completed blocks */}
      {completed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 7,
          background: 'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)',
          pointerEvents: 'none',
        }} />
      )}

      {!tooNarrow && block.label}

      {hovered && (
        <div
          data-no-pan
          style={{
            position: 'absolute',
            bottom: height + 10,
            left: 0,
            background: '#ffffff',
            border: '1px solid #e8e4dd',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: '#1a1a2e',
            whiteSpace: 'nowrap',
            zIndex: 50,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            pointerEvents: 'none',
            minWidth: 160,
          }}
        >
          <div style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: block.color,
            display: 'inline-block',
            marginRight: 6,
            verticalAlign: 'middle',
          }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{block.label}</span>
          <div style={{ color: '#8a8580', marginTop: 5, fontSize: 11 }}>
            {fmtDate(block.start)} → {fmtDate(block.end)}
            <span style={{ marginLeft: 8, color: '#b0aaa0' }}>
              {days} day{days !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
