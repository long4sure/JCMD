"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades/slides a section's content in once it scrolls into view. Purely
 * decorative — implemented with a tiny IntersectionObserver, no animation
 * library. The actual motion (see .reveal in globals.css) only applies under
 * `@media (prefers-reduced-motion: no-preference)`; users who've asked for
 * reduced motion just see the content, fully visible, immediately.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
