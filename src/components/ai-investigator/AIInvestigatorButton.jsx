import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Trust Vision AI Investigator Floating Action Button (FAB)
 * 
 * Uses Uiverse.io metallic/glass design.
 * Fixed to the viewport at z-index: 9999.
 * MUST REMAIN MOUNTED AT ALL TIMES REGARDLESS OF PANEL VISIBILITY.
 * 
 * Supports mouse drag, touch drag, click, and keyboard activation.
 */
export default function AIInvestigatorButton({ isOpen, onClick }) {
  const [customPos, setCustomPos] = useState(null);

  const buttonRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const elem = buttonRef.current;
    if (!elem) return;

    const rect = elem.getBoundingClientRect();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x: rect.left, y: rect.top };

    const onMouseMove = (ev) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      const width = rect.width || 170;
      const height = rect.height || 48;
      const maxX = window.innerWidth - width - 12;
      const maxY = window.innerHeight - height - 12;

      newX = Math.max(12, Math.min(newX, maxX));
      newY = Math.max(12, Math.min(newY, maxY));

      setCustomPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const elem = buttonRef.current;
    if (!elem) return;

    const rect = elem.getBoundingClientRect();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = { x: rect.left, y: rect.top };

    const onTouchMove = (ev) => {
      if (!isDraggingRef.current || ev.touches.length !== 1) return;
      const t = ev.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      const width = rect.width || 170;
      const height = rect.height || 48;
      const maxX = window.innerWidth - width - 12;
      const maxY = window.innerHeight - height - 12;

      newX = Math.max(12, Math.min(newX, maxX));
      newY = Math.max(12, Math.min(newY, maxY));

      setCustomPos({ x: newX, y: newY });
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      style={
        customPos
          ? {
              left: `${customPos.x}px`,
              top: `${customPos.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
          : undefined
      }
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isOpen ? "Close AI Investigator" : "Open AI Investigator"}
      aria-expanded={isOpen}
      title={isOpen ? "Close AI Investigator Chat" : "Open AI Investigator Chat"}
      className="ai-fab-btn"
    >
      <span className="button-outer">
        <span className="button-inner">
          <span>
            <Sparkles className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle' }} />
            {' '}AI Investigator
          </span>
        </span>
      </span>
    </button>
  );
}
