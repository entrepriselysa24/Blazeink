"use client";

import { useEffect, useRef } from "react";

/**
 * Original fleur-de-lis cursor in silver. Desktop with a fine pointer only; touch devices keep the
 * standard behaviour. Text fields keep the native text cursor. With reduced motion it stays still (no rotation).
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const el = ref.current!;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let x = -100, y = -100, raf = 0;
    const render = () => {
      raf = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      el.classList.add("is-visible");
      const target = e.target as Element | null;
      const interactive = target?.closest("a, button, [role='button'], label, select, summary");
      const typing = target?.closest("input:not([type='checkbox']):not([type='file']), textarea");
      el.classList.toggle("is-hover", !!interactive && !typing);
      el.classList.toggle("is-hidden", !!typing);
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onDown = () => {
      el.classList.remove("is-pressed");
      void el.offsetWidth; // restart the pulse animation
      el.classList.add("is-pressed");
    };
    const onLeave = () => el.classList.remove("is-visible");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <svg viewBox="0 0 26 26">
        <defs>
          <linearGradient id="fdl-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2f2f2" />
            <stop offset="0.45" stopColor="#c0c0c0" />
            <stop offset="1" stopColor="#7d7d7d" />
          </linearGradient>
        </defs>
        <circle className="pulse" cx="13" cy="13" r="12" />
        {/* Original fleur-de-lis drawn for Blaze Ink: tip at the top is the hotspot */}
        <g fill="url(#fdl-silver)">
          <path d="M13 1.2c1.9 2.1 3 4.5 3 7 0 2.7-1.3 5-3 6.9-1.7-1.9-3-4.2-3-6.9 0-2.5 1.1-4.9 3-7z" />
          <path d="M11.4 14.2c-1.6-1.4-3.4-2-5-1.5-1.5.5-2.3 1.9-1.9 3.3.3 1.1 1.3 1.7 2.3 1.5-.6-.7-.6-1.7.1-2.2.9-.6 2.4-.4 3.6.5z" />
          <path d="M14.6 14.2c1.6-1.4 3.4-2 5-1.5 1.5.5 2.3 1.9 1.9 3.3-.3 1.1-1.3 1.7-2.3 1.5.6-.7.6-1.7-.1-2.2-.9-.6-2.4-.4-3.6.5z" />
          <rect x="8.2" y="16.4" width="9.6" height="1.6" rx=".4" />
          <path d="M12.1 18.6h1.8l.5 4.2c.1.8-.6 1.5-1.4 1.5s-1.5-.7-1.4-1.5z" />
        </g>
        <path className="glint" d="M13 3.4l.5 1.9 1.9.5-1.9.5-.5 1.9-.5-1.9-1.9-.5 1.9-.5z" fill="#fff" />
      </svg>
    </div>
  );
}
