"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { playInline, prepareInlineVideo, reloadFromBlob } from "@/lib/video";

/**
 * Cinematic intro, ~11 s, two scenes:
 *  1. Logo reveal (0–5.8 s): darkness, a silver light crosses the frame, the original BI monogram opens from the
 *     centre outwards, the lettering is uncovered and a metallic glint runs across it. Built from the original
 *     logo artwork with CSS masks: the logo itself is never redrawn.
 *  2. Real macro footage of Biagio at work (5.8–9.6 s), then an ornamental ink line draws itself and floods into
 *     the site (9.6–11.2 s).
 * Skippable at any time (button or Esc), shown once every 14 days, never with reduced motion or data saving
 * (see the boot script in layout.tsx). If the video cannot play, its poster frame is shown instead (2D fallback).
 */

const STORAGE_KEY = "bi-intro-seen";
const INTRO_SRC = "/video/intro-macro.mp4";
const T_SCENE2 = 5800;
const T_INK = 9500;
const T_DONE = 11300;

type Phase = "idle" | "playing" | "scene2" | "ink" | "done" | "off";

export default function Intro({ t }: { t: Dictionary["intro"] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [videoOk, setVideoOk] = useState(true);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("done");
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
    document.documentElement.style.overflow = "";
    window.setTimeout(() => setPhase("off"), 950);
  }, []);

  useEffect(() => {
    if (document.documentElement.getAttribute("data-intro") === "off") {
      setPhase("off");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    // Start on the next frame so the CSS animations run from their first keyframe.
    const raf = requestAnimationFrame(() => setPhase("playing"));
    // Make the scene 2 video muted + inline right away, so phones allow it to play later.
    if (videoRef.current) prepareInlineVideo(videoRef.current);
    skipRef.current?.focus({ preventScroll: true });

    timers.current.push(
      window.setTimeout(() => {
        setPhase("scene2");
        const v = videoRef.current;
        if (v) {
          try {
            v.currentTime = 0;
          } catch {}
          playInline(v, INTRO_SRC).then((ok) => !ok && setVideoOk(false));
        }
      }, T_SCENE2),
      window.setTimeout(() => setPhase("ink"), T_INK),
      window.setTimeout(finish, T_DONE),
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [finish]);

  if (phase === "off") return null;

  const cls = [
    "intro grain",
    phase !== "idle" && "is-playing",
    (phase === "scene2" || phase === "ink" || phase === "done") && "is-scene2",
    (phase === "ink" || phase === "done") && "is-ink",
    phase === "done" && "is-done",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} role="dialog" aria-modal="true" aria-label={t.label}>
      <div className="intro-sweep" aria-hidden="true" />

      <div className="intro-logo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="intro-emblem" src="/brand/blaze-ink-emblem.png" alt="" width={761} height={790} decoding="async" />
        <div className="intro-wordmark-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="intro-wordmark" src="/brand/blaze-ink-wordmark.png" alt="" width={581} height={100} decoding="async" />
          <span className="intro-glint" />
        </div>
      </div>

      <div className="intro-scene2" aria-hidden="true">
        {videoOk ? (
          <video
            ref={videoRef}
            src={INTRO_SRC}
            poster="/video/intro-macro-poster.jpg"
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              const v = e.currentTarget;
              // Retry once from memory before falling back to the still frame.
              if (v.src.startsWith("blob:")) setVideoOk(false);
              else reloadFromBlob(v, INTRO_SRC).then((ok) => !ok && setVideoOk(false));
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/video/intro-macro-poster.jpg" alt="" />
        )}
      </div>

      <svg className="intro-line" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path
          pathLength={1}
          d="M1030 478 C 1060 520 1110 556 1180 548 C 1262 538 1292 460 1244 432 C 1204 410 1162 450 1190 476 C 1222 506 1300 492 1360 448 C 1420 404 1470 380 1530 396 C 1590 412 1610 470 1572 492 C 1540 510 1508 488 1520 462 C 1534 432 1600 430 1680 452"
        />
        <rect className="flood" x="-100" y="-100" width="1800" height="1100" />
      </svg>

      <button ref={skipRef} type="button" className="intro-skip" onClick={finish}>
        {t.skip}
      </button>
    </div>
  );
}
