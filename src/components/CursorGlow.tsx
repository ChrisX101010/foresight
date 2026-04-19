'use client';

// ────────────────────────────────────────────────────────────────────────
// Cursor-following plasma glow — two layers.
//
// Desktop:
//   • Outer glow: large, soft, slow-tracking, gently "breathes" (scales)
//     so the static landing page still feels alive when the cursor is
//     still.
//   • Inner glow: smaller, tighter, fast-tracking — reads as a focused
//     beam at the cursor tip.
//
// Touch / reduced-motion:
//   • Disable cursor tracking entirely (would otherwise sit dead-center
//     on phones). Fall back to a single ambient glow that slowly drifts,
//     giving the landing page the same "plasma pulse" feel without the
//     pointer dependence.
// ────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const outerTarget = useRef({ x: 0, y: 0 });
  const outerCurrent = useRef({ x: 0, y: 0 });
  const innerTarget = useRef({ x: 0, y: 0 });
  const innerCurrent = useRef({ x: 0, y: 0 });

  const frameId = useRef<number | null>(null);
  const breathStart = useRef<number>(0);

  // Start false and promote on the client — avoids SSR/hydration mismatch.
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    setIsTouch(coarse || reducedMotion);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    outerTarget.current = { x: w / 2, y: h / 3 };
    outerCurrent.current = { ...outerTarget.current };
    innerTarget.current = { ...outerTarget.current };
    innerCurrent.current = { ...outerTarget.current };
    breathStart.current = performance.now();

    const handleMove = (e: MouseEvent) => {
      outerTarget.current = { x: e.clientX, y: e.clientY };
      innerTarget.current = { x: e.clientX, y: e.clientY };
    };

    const ambientDrift = (t: number) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 3;
      outerTarget.current = {
        x: cx + Math.sin(t / 4200) * window.innerWidth * 0.15,
        y: cy + Math.cos(t / 3800) * window.innerHeight * 0.08,
      };
    };

    const animate = (now: number) => {
      if (isTouch) ambientDrift(now);

      outerCurrent.current.x +=
        (outerTarget.current.x - outerCurrent.current.x) * 0.06;
      outerCurrent.current.y +=
        (outerTarget.current.y - outerCurrent.current.y) * 0.06;

      innerCurrent.current.x +=
        (innerTarget.current.x - innerCurrent.current.x) * 0.22;
      innerCurrent.current.y +=
        (innerTarget.current.y - innerCurrent.current.y) * 0.22;

      const elapsed = now - breathStart.current;
      const breath = 1 + Math.sin(elapsed / 800) * 0.08;

      outer.style.setProperty('--mx', `${outerCurrent.current.x}px`);
      outer.style.setProperty('--my', `${outerCurrent.current.y}px`);
      outer.style.setProperty('--breath', breath.toFixed(3));

      if (inner) {
        inner.style.setProperty('--mx', `${innerCurrent.current.x}px`);
        inner.style.setProperty('--my', `${innerCurrent.current.y}px`);
      }

      frameId.current = requestAnimationFrame(animate);
    };

    if (!isTouch) {
      window.addEventListener('mousemove', handleMove, { passive: true });
    }
    frameId.current = requestAnimationFrame(animate);

    return () => {
      if (!isTouch) window.removeEventListener('mousemove', handleMove);
      if (frameId.current !== null) cancelAnimationFrame(frameId.current);
    };
  }, [isTouch]);

  return (
    <>
      <div
        ref={outerRef}
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(calc(700px * var(--breath, 1)) circle at var(--mx) var(--my), rgba(198, 255, 61, 0.10), rgba(198, 255, 61, 0.03) 35%, transparent 60%)',
        }}
        aria-hidden
      />
      {!isTouch && (
        <div
          ref={innerRef}
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(180px circle at var(--mx) var(--my), rgba(198, 255, 61, 0.14), rgba(198, 255, 61, 0.05) 30%, transparent 55%)',
            mixBlendMode: 'screen',
          }}
          aria-hidden
        />
      )}
    </>
  );
}
