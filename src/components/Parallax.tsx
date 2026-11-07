"use client";

import { useEffect, useRef } from "react";

/** Very light parallax: the layer drifts at a fraction of the scroll speed. Off with reduced motion. */
export default function Parallax({ children, className, speed = 0.1 }: { children: React.ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.parentElement!.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      el.style.transform = `translate3d(0, ${(-rect.top * speed).toFixed(1)}px, 0) scale(1.06)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
