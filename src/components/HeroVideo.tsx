"use client";

import { useEffect, useRef, useState } from "react";
import { playInline, prepareInlineVideo, reloadFromBlob } from "@/lib/video";

/**
 * Silent ambient film (real footage of Biagio at work): muted, looping, never with sound.
 * Plays only while on screen. Built to start reliably on phones (see lib/video.ts).
 * With reduced motion or data saving on, only the still frame is shown. When the phone refuses autoplay
 * (e.g. iPhone Low Power Mode) the poster frame stays visible and the film starts at the first touch.
 */
export default function HeroVideo({
  label,
  src = "/video/hero-studio.mp4",
  poster = "/video/hero-studio-poster.jpg",
  startAt = 0,
}: {
  label: string;
  src?: string;
  poster?: string;
  /** Second to start from on first play (lets two sections use the same file without showing the same shot). */
  startAt?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const v = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const save = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""));
    if (reduce || save) {
      setStill(true);
      v?.pause();
      return;
    }
    if (!v) return;
    prepareInlineVideo(v);

    if (startAt) {
      const seek = () => {
        if (v.currentTime < startAt) v.currentTime = startAt;
      };
      if (v.readyState >= 1) seek();
      else v.addEventListener("loadedmetadata", seek, { once: true });
    }

    // If the phone refuses to play, the paused video keeps showing its poster frame.
    const start = () => void playInline(v, src);

    // Play only while visible, to save battery and CPU.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : v.pause()));
    io.observe(v);

    // iPhone in Low Power Mode refuses autoplay but allows playing after the first touch.
    const onTouch = () => {
      if (v.paused && v.isConnected) start();
    };
    window.addEventListener("touchend", onTouch, { once: true, passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("touchend", onTouch);
    };
  }, [src, startAt]);

  if (still) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} className="h-full w-full object-cover" />;
  }
  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label={label}
      disablePictureInPicture
      onError={(e) => {
        const v = e.currentTarget;
        // Retry once from memory before falling back to the still frame.
        if (v.src.startsWith("blob:")) setStill(true);
        else reloadFromBlob(v, src).then((ok) => (ok ? void playInline(v, src) : setStill(true)));
      }}
    />
  );
}
