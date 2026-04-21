'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Detects value changes and returns a flash direction for ~250ms after
 * each change. Consumer applies a Tailwind color class based on the
 * return value. The Bloomberg-terminal pattern: flash on actual change,
 * silence otherwise.
 *
 * Returns 'up' | 'down' | null.
 */
export function usePriceFlash(value: number, durationMs = 250): 'up' | 'down' | null {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    // First render: record baseline, don't flash.
    if (prev.current === null) {
      prev.current = value;
      return;
    }
    if (value === prev.current) return;
    const direction: 'up' | 'down' = value > prev.current ? 'up' : 'down';
    setFlash(direction);
    prev.current = value;
    const t = setTimeout(() => setFlash(null), durationMs);
    return () => clearTimeout(t);
  }, [value, durationMs]);

  return flash;
}
