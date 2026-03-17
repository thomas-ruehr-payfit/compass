import { useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';

const Canvas = forwardRef(function Canvas({ children, initialX = 0, initialY = 0, onZoom }, ref) {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const translate = useRef({ x: initialX, y: initialY });
  const hasMoved = useRef(false);

  // Keep a stable ref to onZoom to avoid stale closures in the wheel handler
  const onZoomRef = useRef(onZoom);
  useEffect(() => { onZoomRef.current = onZoom; }, [onZoom]);

  // Expose reset() and getTranslate() so parent can control position
  useImperativeHandle(ref, () => ({
    reset(x, y) {
      translate.current = { x, y };
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    },
    getTranslate() {
      return { ...translate.current };
    },
  }));

  // Apply initial position once on first render
  const applyTransform = useCallback(() => {
    if (innerRef.current) {
      innerRef.current.style.transform =
        `translate(${translate.current.x}px, ${translate.current.y}px)`;
    }
  }, []);

  const innerRefCallback = useCallback((node) => {
    innerRef.current = node;
    if (node) applyTransform();
  }, [applyTransform]);

  const onMouseDown = useCallback((e) => {
    // Ignore clicks on interactive elements inside the canvas
    if (e.target.closest('[data-no-pan]')) return;
    isDragging.current = true;
    hasMoved.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    containerRef.current.style.cursor = 'grabbing';
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) hasMoved.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    translate.current.x += dx;
    translate.current.y += dy;
    if (innerRef.current) {
      innerRef.current.style.transform =
        `translate(${translate.current.x}px, ${translate.current.y}px)`;
    }
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  // Support trackpad / mouse wheel — ctrlKey means pinch-to-zoom on macOS.
  // Must be attached via addEventListener with { passive: false } so that
  // e.preventDefault() is actually respected (React's onWheel prop is passive).
  const onWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Pinch gesture → zoom, keeping the point under the cursor fixed
      onZoomRef.current?.(e.deltaY, e.clientX, e.clientY);
    } else {
      // Two-finger scroll → pan
      translate.current.x -= e.deltaX;
      translate.current.y -= e.deltaY;
      if (innerRef.current) {
        innerRef.current.style.transform =
          `translate(${translate.current.x}px, ${translate.current.y}px)`;
      }
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        cursor: 'grab',
        position: 'relative',
      }}
    >
      <div ref={innerRefCallback} style={{ position: 'absolute', top: 0, left: 0 }}>
        {children}
      </div>
    </div>
  );
});

export default Canvas;
