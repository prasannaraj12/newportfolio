"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Auto-advancing index that only runs while the element is on screen and
 * pauses for a while after the visitor takes control.
 */
export function useCycle(length: number, intervalMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const pausedUntil = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [visible, length, intervalMs]);

  const select = (i: number) => {
    pausedUntil.current = Date.now() + 9000;
    setIndex(i);
  };

  return { ref, index, select, visible };
}
