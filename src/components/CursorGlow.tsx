'use client';

// ────────────────────────────────────────────────────────────────────────
// Cursor-following plasma glow.
//
// Uses requestAnimationFrame + CSS vars instead of React state so we don't
// re-render on every pixel of mouse movement. The glow is a fixed-position
// radial gradient that tracks the cursor via --mx/--my custom properties.
//
// Only mounts on pages that opt in — avoids distracting the user on the
// deposit flow or the docs page where they're focusing on content.
// ────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    // Start at viewport center so the initial render has something visible.
    targetPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    currentPos.current = { ...targetPos.current };

    const handleMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Smooth lerp — 0.12 feels snappy but not twitchy. Raise for snappier.
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.12;

      el.style.setProperty('--mx', `${currentPos.current.x}px`);
      el.style.setProperty('--my', `${currentPos.current.y}px`);

      frameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    frameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (frameId.current !== null) cancelAnimationFrame(frameId.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          'radial-gradient(600px circle at var(--mx) var(--my), rgba(198, 255, 61, 0.09), transparent 40%)',
      }}
      aria-hidden
    />
  );
}
