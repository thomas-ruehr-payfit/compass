import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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

export default function ProjectModal({ block, content, onClose }) {
  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const days = dayCount(block.start, block.end);

  return (
    <div
      data-no-pan
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,18,15,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '24px 16px',
      }}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        data-no-pan
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fffefb',
          border: '1px solid #e8e4dd',
          borderRadius: 12,
          width: '100%',
          maxWidth: 640,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px 16px',
            borderBottom: '1px solid #e8e4dd',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: block.color,
              boxShadow: `0 0 8px ${block.color}66`,
              marginTop: 4,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', letterSpacing: '0.01em' }}>
              {block.label}
            </div>
            <div style={{ fontSize: 11, color: '#b0aaa0', marginTop: 3 }}>
              {fmtDate(block.start)} → {fmtDate(block.end)}
              <span style={{ marginLeft: 8 }}>{days} day{days !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button
            data-no-pan
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#c8c3bb',
              fontSize: 18,
              lineHeight: 1,
              padding: '2px 4px',
              borderRadius: 4,
              fontFamily: 'inherit',
              transition: 'color 0.12s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#6b6560')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#c8c3bb')}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Markdown body */}
        <div
          style={{
            padding: '20px 24px 28px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {content ? (
            <div className="md-body">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p style={{ color: '#b0aaa0', fontSize: 13, fontStyle: 'italic' }}>
              No notes yet for this project.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
